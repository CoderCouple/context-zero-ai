'use client'

import { useState, useRef, useEffect } from 'react'
import { Play, RefreshCw, Copy, Check } from 'lucide-react'
import { Highlight, themes } from 'prism-react-renderer'

interface PythonSimulatorProps {
  title?: string
  initialCode?: string
}

export default function PythonSimulatorEnhanced({
  title = 'Python Code Simulator',
  initialCode = '# Python code simulator\nprint("Hello, World!")',
}: PythonSimulatorProps) {
  const [code, setCode] = useState(initialCode)
  const [output, setOutput] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const [copied, setCopied] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const highlightRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    // Check if dark mode is enabled
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'))
    }

    checkDarkMode()

    // Watch for theme changes
    const observer = new MutationObserver(checkDarkMode)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })

    return () => observer.disconnect()
  }, [])

  const simulatePython = (code: string) => {
    const lines = code.split('\n')
    const output: string[] = []
    const variables: { [key: string]: any } = {
      np: {
        zeros: (size: number) => `array([0. 0. 0. ... ])  # shape: (${size},)`,
        array: (arr: any) => `array(${JSON.stringify(arr)})`,
      },
    }

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const trimmed = line.trim()

      // Skip empty lines and comments
      if (!trimmed || trimmed.startsWith('#')) continue

      // Handle imports
      if (trimmed.startsWith('import ') || trimmed.startsWith('from ')) {
        // Silently handle imports
        continue
      }

      // Handle for loops
      if (trimmed.startsWith('for ')) {
        const forMatch = trimmed.match(/for\s+(\w+)\s+in\s+(.+):/)
        if (forMatch) {
          const loopVar = forMatch[1]
          const iterableExpr = forMatch[2]

          // Get the iterable
          let iterable: any[] = []
          if (iterableExpr in variables) {
            iterable = variables[iterableExpr]
          } else if (iterableExpr.startsWith('[') && iterableExpr.endsWith(']')) {
            try {
              iterable = JSON.parse(iterableExpr)
            } catch {
              iterable = []
            }
          } else {
            // Try to evaluate as variable
            try {
              iterable = eval(
                iterableExpr.replace(/(\w+)/g, (match) => {
                  return variables[match] !== undefined ? JSON.stringify(variables[match]) : match
                })
              )
            } catch {
              iterable = []
            }
          }

          // Collect loop body
          const loopBody: string[] = []
          const indent = line.match(/^\s*/)?.[0].length || 0
          let j = i + 1
          while (j < lines.length) {
            const nextLine = lines[j]
            const nextIndent = nextLine.match(/^\s*/)?.[0].length || 0
            if (nextIndent > indent && nextLine.trim()) {
              loopBody.push(nextLine)
              j++
            } else if (nextLine.trim()) {
              break
            } else {
              j++
            }
          }

          // Execute loop body for each item
          for (const item of iterable) {
            variables[loopVar] = item
            // Process loop body with current loop variable
            const loopCode = loopBody.join('\n')
            const loopResult = simulatePython(loopCode)
            if (loopResult) {
              output.push(loopResult)
            }
          }

          i = j - 1
          continue
        }
      }

      // Handle print statements
      if (trimmed.startsWith('print(') && trimmed.endsWith(')')) {
        const content = trimmed.slice(6, -1).trim()

        // Handle f-strings
        if (content.startsWith('f"') || content.startsWith("f'")) {
          const quote = content[1]
          const endIdx = content.lastIndexOf(quote)
          let fstring = content.slice(2, endIdx)

          // Handle escape sequences
          fstring = fstring.replace(/\\n/g, '\n').replace(/\\t/g, '\t')

          // Replace all {expression} in the f-string
          fstring = fstring.replace(/\{([^}]+)\}/g, (match, expr) => {
            // Handle formatting
            const parts = expr.split(':')
            const expression = parts[0].trim()
            const format = parts[1]?.trim()

            // Evaluate the expression
            let value: any

            // Function calls
            if (expression.includes('(') && expression.includes(')')) {
              const funcMatch = expression.match(/(\w+)\((.*)\)/)
              if (funcMatch) {
                const [, func, args] = funcMatch

                // Evaluate the argument if it's an expression
                let argValue: any = args
                if (
                  args.includes('-') ||
                  args.includes('+') ||
                  args.includes('*') ||
                  args.includes('/')
                ) {
                  try {
                    let evalExpr = args
                    for (const [vName, vValue] of Object.entries(variables)) {
                      if (typeof vValue === 'number') {
                        evalExpr = evalExpr.replace(
                          new RegExp(`\\b${vName}\\b`, 'g'),
                          String(vValue)
                        )
                      }
                    }
                    argValue = eval(evalExpr)
                  } catch {
                    argValue = variables[args] !== undefined ? variables[args] : args
                  }
                } else {
                  argValue =
                    variables[args] !== undefined
                      ? variables[args]
                      : !isNaN(Number(args))
                        ? Number(args)
                        : args
                }

                if (func === 'abs') {
                  value = Math.abs(Number(argValue))
                } else if (func === 'int') {
                  value = Math.floor(Number(argValue))
                } else if (func === 'round') {
                  value = Math.round(Number(argValue))
                } else {
                  value = expression
                }
              }
            }
            // Simple variable
            else if (expression in variables) {
              value = variables[expression]
            }
            // Arithmetic expression (including ** for power)
            else if (/[+\-*\/]/.test(expression) || expression.includes('**')) {
              try {
                let evalExpr = expression
                // Replace ** with Math.pow for safe evaluation
                evalExpr = evalExpr.replace(/(\w+|\d+)\s*\*\*\s*(\w+|\d+)/g, (match, base, exp) => {
                  const baseVal = variables[base] !== undefined ? variables[base] : base
                  const expVal = variables[exp] !== undefined ? variables[exp] : exp
                  return `Math.pow(${baseVal}, ${expVal})`
                })
                // Replace variables with their values
                for (const [varName, varValue] of Object.entries(variables)) {
                  if (typeof varValue === 'number' || typeof varValue === 'string') {
                    evalExpr = evalExpr.replace(
                      new RegExp(`\\b${varName}\\b`, 'g'),
                      String(varValue)
                    )
                  }
                }
                value = eval(evalExpr)
              } catch {
                value = expression
              }
            }
            // Direct number
            else if (!isNaN(Number(expression))) {
              value = Number(expression)
            } else {
              value = expression
            }

            // Apply formatting
            if (format) {
              if (format.match(/\.?\d*f$/)) {
                const decimals = format.match(/\.(\d+)f$/)?.[1]
                if (decimals) {
                  return Number(value).toFixed(parseInt(decimals))
                }
                return String(value)
              }
            }

            return String(value)
          })

          output.push(fstring)
        }
        // Handle string multiplication like "=" * 40
        else if (content.includes('*') && !content.includes(',')) {
          const parts = content.split('*').map((p) => p.trim())
          if (parts.length === 2) {
            let str = ''
            let num = 0

            for (const part of parts) {
              if (
                (part.startsWith('"') && part.endsWith('"')) ||
                (part.startsWith("'") && part.endsWith("'"))
              ) {
                str = part.slice(1, -1)
              } else if (!isNaN(Number(part))) {
                num = Number(part)
              } else if (part in variables) {
                const val = variables[part]
                if (typeof val === 'number') num = val
                if (typeof val === 'string') str = val
              }
            }

            if (str && num > 0) {
              output.push(str.repeat(num))
            }
          }
        }
        // Handle regular strings
        else if (
          (content.startsWith('"') && content.endsWith('"')) ||
          (content.startsWith("'") && content.endsWith("'"))
        ) {
          output.push(content.slice(1, -1))
        }
        // Handle variables
        else if (content in variables) {
          output.push(String(variables[content]))
        }
        continue
      }

      // Handle variable assignments
      if (trimmed.includes('=') && !trimmed.includes('==')) {
        const eqIndex = trimmed.indexOf('=')
        const varName = trimmed.slice(0, eqIndex).trim()
        const value = trimmed.slice(eqIndex + 1).trim()

        // Handle numbers
        if (!isNaN(Number(value))) {
          variables[varName] = Number(value)
        }
        // Handle strings
        else if (
          (value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))
        ) {
          variables[varName] = value.slice(1, -1)
        }
        // Handle lists
        else if (value.startsWith('[') && value.endsWith(']')) {
          try {
            variables[varName] = JSON.parse(value)
          } catch {
            variables[varName] = value
          }
        }
        // Handle arithmetic expressions (including **)
        else if (/[+\-*\/]/.test(value) || value.includes('**')) {
          try {
            let evalExpr = value
            // Replace ** with Math.pow
            evalExpr = evalExpr.replace(/(\w+|\d+)\s*\*\*\s*(\w+|\d+)/g, (match, base, exp) => {
              const baseVal = variables[base] !== undefined ? variables[base] : base
              const expVal = variables[exp] !== undefined ? variables[exp] : exp
              return `Math.pow(${baseVal}, ${expVal})`
            })
            // Replace variables with values
            for (const [vName, vValue] of Object.entries(variables)) {
              if (typeof vValue === 'number') {
                evalExpr = evalExpr.replace(new RegExp(`\\b${vName}\\b`, 'g'), String(vValue))
              }
            }
            variables[varName] = eval(evalExpr)
          } catch {
            variables[varName] = value
          }
        }
        // Handle function calls like int(...)
        else if (value.startsWith('int(') && value.endsWith(')')) {
          const innerExpr = value.slice(4, -1)
          if (innerExpr.includes('*')) {
            try {
              let evalExpr = innerExpr
              for (const [vName, vValue] of Object.entries(variables)) {
                if (typeof vValue === 'number') {
                  evalExpr = evalExpr.replace(new RegExp(`\\b${vName}\\b`, 'g'), String(vValue))
                }
              }
              variables[varName] = Math.floor(eval(evalExpr))
            } catch {
              variables[varName] = 0
            }
          }
        }
        // Handle variable references
        else if (value in variables) {
          variables[varName] = variables[value]
        }
        continue
      }
    }

    return output.join('\n')
  }

  const runCode = () => {
    setIsRunning(true)
    setOutput('')

    setTimeout(() => {
      try {
        const result = simulatePython(code)
        setOutput(result || 'No output')
      } catch (error) {
        setOutput(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      } finally {
        setIsRunning(false)
      }
    }, 100)
  }

  const resetCode = () => {
    setCode(initialCode)
    setOutput('')
  }

  const copyCode = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="my-8 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between bg-gray-100 px-4 py-2 dark:bg-gray-800">
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{title}</span>
        <div className="flex gap-2">
          <button
            onClick={copyCode}
            className="rounded p-1 transition-colors hover:bg-gray-200 dark:hover:bg-gray-700"
            title="Copy code"
          >
            {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
          </button>
          <button
            onClick={resetCode}
            className="rounded p-1 transition-colors hover:bg-gray-200 dark:hover:bg-gray-700"
            title="Reset"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <button
            onClick={runCode}
            disabled={isRunning}
            className="flex items-center gap-1 rounded bg-blue-500 px-3 py-1 text-sm text-white hover:bg-blue-600 disabled:opacity-50"
          >
            <Play className="h-3 w-3" />
            Run
          </button>
        </div>
      </div>

      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        <div className="p-4">
          <label className="mb-2 block text-xs font-semibold text-gray-600 dark:text-gray-400">
            PYTHON CODE
          </label>
          <div className="relative h-64 w-full overflow-hidden rounded border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900">
            {/* Syntax highlighted display - scrolls with textarea */}
            <div
              className="pointer-events-none absolute inset-0 overflow-auto"
              ref={highlightRef}
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              <Highlight
                theme={isDarkMode ? themes.vsDark : themes.vsLight}
                code={code}
                language="python"
              >
                {({ className, style, tokens, getLineProps, getTokenProps }) => (
                  <pre
                    className="min-h-full p-3 font-mono text-sm"
                    style={{ ...style, background: 'transparent', margin: 0 }}
                  >
                    <code>
                      {tokens.map((line, i) => (
                        <div key={i} {...getLineProps({ line })}>
                          {line.map((token, key) => (
                            <span key={key} {...getTokenProps({ token })} />
                          ))}
                          {i === tokens.length - 1 && '\n'}
                        </div>
                      ))}
                    </code>
                  </pre>
                )}
              </Highlight>
            </div>

            {/* Editable textarea with visible scrolling */}
            <textarea
              ref={textareaRef}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onScroll={(e) => {
                if (highlightRef.current) {
                  highlightRef.current.scrollTop = e.currentTarget.scrollTop
                  highlightRef.current.scrollLeft = e.currentTarget.scrollLeft
                }
              }}
              className="relative h-full w-full resize-none overflow-auto bg-transparent p-3 font-mono text-sm text-transparent caret-black focus:outline-none dark:caret-white"
              style={{
                caretColor: 'currentColor',
                WebkitTextFillColor: 'transparent',
              }}
              spellCheck={false}
            />
          </div>
        </div>

        <div className="bg-gray-50 p-4 dark:bg-gray-800">
          <label className="mb-2 block text-xs font-semibold text-gray-600 dark:text-gray-400">
            OUTPUT
          </label>
          <div className="max-h-64 min-h-[100px] overflow-auto whitespace-pre-wrap rounded border border-gray-200 bg-white p-3 font-mono text-sm dark:border-gray-700 dark:bg-gray-900">
            {output || <span className="text-gray-400">Output will appear here...</span>}
          </div>
        </div>
      </div>
    </div>
  )
}
