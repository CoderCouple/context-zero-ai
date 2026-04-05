'use client'

import { useState, useRef, useEffect } from 'react'
import { Play, RefreshCw, Copy, Check } from 'lucide-react'
import { Highlight, themes } from 'prism-react-renderer'

interface PythonSimulatorProps {
  title?: string
  initialCode?: string
}

export default function PythonSimulator({
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
    const variables: { [key: string]: any } = {}

    // Simple Python simulator for basic operations
    for (const line of lines) {
      const trimmed = line.trim()

      // Skip empty lines and comments
      if (!trimmed || trimmed.startsWith('#')) continue

      // Handle print statements
      if (trimmed.startsWith('print(') && trimmed.endsWith(')')) {
        const content = trimmed.slice(6, -1)

        // Handle f-strings (simplified)
        if (content.startsWith('f"') || content.startsWith("f'")) {
          let result = content.slice(2, -1)
          // Replace variables in f-string
          for (const [key, value] of Object.entries(variables)) {
            result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value))
          }
          output.push(result)
        }
        // Handle regular strings
        else if (
          (content.startsWith('"') && content.endsWith('"')) ||
          (content.startsWith("'") && content.endsWith("'"))
        ) {
          output.push(content.slice(1, -1))
        }
        // Handle variables
        else if (variables[content]) {
          output.push(String(variables[content]))
        }
        // Handle expressions
        else {
          try {
            // Simple expression evaluation
            const result = Function('"use strict"; return (' + content + ')')()
            output.push(String(result))
          } catch {
            output.push(content)
          }
        }
      }

      // Handle variable assignments
      else if (trimmed.includes('=') && !trimmed.includes('==')) {
        const [varName, ...valueParts] = trimmed.split('=')
        const value = valueParts.join('=').trim()
        const cleanVarName = varName.trim()

        // Handle numpy-like arrays (simplified)
        if (value.includes('np.array')) {
          const arrayMatch = value.match(/\[(.*?)\]/)
          if (arrayMatch) {
            variables[cleanVarName] = JSON.parse(`[${arrayMatch[1]}]`)
          }
        }
        // Handle numpy zeros
        else if (value.includes('np.zeros')) {
          const sizeMatch = value.match(/\((\d+)\)/)
          if (sizeMatch) {
            const size = parseInt(sizeMatch[1])
            variables[cleanVarName] = new Array(size).fill(0)
          }
        }
        // Handle numpy linspace (simplified)
        else if (value.includes('np.linspace')) {
          const match = value.match(/\(([\d.-]+),\s*([\d.-]+),\s*(\d+)\)/)
          if (match) {
            const start = parseFloat(match[1])
            const end = parseFloat(match[2])
            const num = parseInt(match[3])
            const step = (end - start) / (num - 1)
            variables[cleanVarName] = Array.from({ length: num }, (_, i) => start + i * step)
          }
        }
        // Handle simple math operations
        else if (
          value.includes('*') ||
          value.includes('/') ||
          value.includes('+') ||
          value.includes('-')
        ) {
          try {
            // Replace variable names with their values
            let expr = value
            for (const [key, val] of Object.entries(variables)) {
              if (typeof val === 'number') {
                expr = expr.replace(new RegExp(`\\b${key}\\b`, 'g'), String(val))
              }
            }
            variables[cleanVarName] = Function('"use strict"; return (' + expr + ')')()
          } catch {
            variables[cleanVarName] = value
          }
        }
        // Handle numbers
        else if (!isNaN(Number(value))) {
          variables[cleanVarName] = Number(value)
        }
        // Handle strings
        else if (
          (value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))
        ) {
          variables[cleanVarName] = value.slice(1, -1)
        }
        // Handle variable references
        else if (variables[value]) {
          variables[cleanVarName] = variables[value]
        } else {
          variables[cleanVarName] = value
        }
      }

      // Handle .shape property
      else if (trimmed.includes('.shape')) {
        const varName = trimmed.split('.')[0].trim()
        if (variables[varName] && Array.isArray(variables[varName])) {
          output.push(`(${variables[varName].length},)`)
        }
      }

      // Handle for loops (very simplified)
      else if (trimmed.startsWith('for ')) {
        const rangeMatch = trimmed.match(/for\s+(\w+)\s+in\s+range\((\d+)\)/)
        if (rangeMatch) {
          const loopVar = rangeMatch[1]
          const limit = parseInt(rangeMatch[2])
          for (let i = 0; i < limit && i < 10; i++) {
            // Limit iterations for safety
            variables[loopVar] = i
            output.push(`Loop iteration ${i}`)
          }
        }
      }
    }

    return output.join('\n')
  }

  const runCode = () => {
    setIsRunning(true)
    setOutput('')

    try {
      const result = simulatePython(code)
      setOutput(result || 'Code executed successfully (no output)')
    } catch (error) {
      setOutput(`Error: ${error.message}`)
    } finally {
      setIsRunning(false)
    }
  }

  const resetCode = () => {
    setCode(initialCode)
    setOutput('')
  }

  const copyCode = () => {
    navigator.clipboard.writeText(code)
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

      <div className="bg-yellow-50 px-4 py-2 text-xs text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300">
        Note: This is a simplified Python simulator for demonstration. For full Python execution,
        use a proper environment.
      </div>
    </div>
  )
}
