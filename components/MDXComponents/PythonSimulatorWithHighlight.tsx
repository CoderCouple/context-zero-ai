'use client'

import { useState } from 'react'
import { Play, RefreshCw, Copy, Check } from 'lucide-react'
import { Highlight, themes } from 'prism-react-renderer'

interface PythonSimulatorProps {
  title?: string
  initialCode?: string
}

export default function PythonSimulatorWithHighlight({
  title = 'Python Code Simulator',
  initialCode = '# Python code simulator\nprint("Hello, World!")',
}: PythonSimulatorProps) {
  const [code, setCode] = useState(initialCode)
  const [output, setOutput] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const [copied, setCopied] = useState(false)

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
        else if (content in variables) {
          output.push(String(variables[content]))
        }
        // Handle expressions with separators
        else if (content.includes(',')) {
          const parts = content.split(',').map((p) => {
            const part = p.trim()
            if (part in variables) {
              return variables[part]
            }
            if (
              (part.startsWith('"') && part.endsWith('"')) ||
              (part.startsWith("'") && part.endsWith("'"))
            ) {
              return part.slice(1, -1)
            }
            return part
          })
          output.push(parts.join(' '))
        }
        continue
      }

      // Handle variable assignments
      if (trimmed.includes('=') && !trimmed.includes('==')) {
        const [varName, value] = trimmed.split('=').map((s) => s.trim())

        // Handle imports (simplified)
        if (trimmed.startsWith('import')) {
          output.push(`# ${trimmed} (simulated)`)
          if (varName === 'import numpy as np') {
            variables['np'] = { zeros: () => 'array([0, 0, 0, ...])', shape: '(72000,)' }
          }
          continue
        }

        // Handle string values
        if (
          (value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))
        ) {
          variables[varName] = value.slice(1, -1)
        }
        // Handle numeric values
        else if (!isNaN(Number(value))) {
          variables[varName] = Number(value)
        }
        // Handle array/list
        else if (value.startsWith('[') && value.endsWith(']')) {
          try {
            variables[varName] = JSON.parse(value)
          } catch {
            variables[varName] = value
          }
        }
        // Handle np.zeros (simplified)
        else if (value.includes('np.zeros')) {
          const match = value.match(/np\.zeros\(([^)]+)\)/)
          if (match) {
            const size = eval(match[1]) // Simplified - in production, parse safely
            variables[varName] = `array([0. 0. 0. ... 0. 0. 0.])  # shape: (${size},)`
            variables[`${varName}.shape`] = `(${size},)`
          }
        }
        // Handle calculations
        else if (
          value.includes('*') ||
          value.includes('/') ||
          value.includes('+') ||
          value.includes('-')
        ) {
          try {
            // Replace variables in expression
            let expr = value
            for (const [key, val] of Object.entries(variables)) {
              if (typeof val === 'number') {
                expr = expr.replace(new RegExp(`\\b${key}\\b`, 'g'), String(val))
              }
            }
            variables[varName] = eval(expr) // Simplified - in production, parse safely
          } catch {
            variables[varName] = value
          }
        } else {
          variables[varName] = value
        }
        continue
      }

      // Handle for loops (very simplified)
      if (trimmed.startsWith('for ')) {
        output.push(`# ${trimmed} (loop simulated)`)
        continue
      }

      // Handle if statements (very simplified)
      if (trimmed.startsWith('if ')) {
        output.push(`# ${trimmed} (condition simulated)`)
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
    }, 500)
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
          <div className="relative">
            {/* Syntax highlighted display */}
            <Highlight theme={themes.nightOwl} code={code} language="python">
              {({ className, style, tokens, getLineProps, getTokenProps }) => (
                <pre
                  className="h-64 w-full overflow-auto rounded border border-gray-200 bg-gray-50 p-3 font-mono text-sm dark:border-gray-700 dark:bg-gray-900"
                  style={{ ...style, background: 'transparent' }}
                >
                  <code>
                    {tokens.map((line, i) => (
                      <div key={i} {...getLineProps({ line })}>
                        {line.map((token, key) => (
                          <span key={key} {...getTokenProps({ token })} />
                        ))}
                      </div>
                    ))}
                  </code>
                </pre>
              )}
            </Highlight>

            {/* Invisible textarea for editing */}
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="absolute inset-0 h-64 w-full resize-none bg-transparent p-3 font-mono text-sm text-transparent caret-blue-500 focus:outline-none"
              style={{ caretColor: 'auto' }}
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
