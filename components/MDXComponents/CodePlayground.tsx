'use client'

import { useState } from 'react'
import { Play, RefreshCw } from 'lucide-react'

interface CodePlaygroundProps {
  initialCode?: string
  language?: string
  title?: string
}

export default function CodePlayground({
  initialCode = '// Write your code here\nconsole.log("Hello, World!");',
  language = 'javascript',
  title = 'Code Playground',
}: CodePlaygroundProps) {
  const [code, setCode] = useState(initialCode)
  const [output, setOutput] = useState('')
  const [isRunning, setIsRunning] = useState(false)

  const runCode = () => {
    setIsRunning(true)
    setOutput('')

    try {
      // Create a custom console to capture output
      const logs: string[] = []
      const customConsole = {
        log: (...args: any[]) => logs.push(args.map(String).join(' ')),
        error: (...args: any[]) => logs.push(`Error: ${args.map(String).join(' ')}`),
        warn: (...args: any[]) => logs.push(`Warning: ${args.map(String).join(' ')}`),
      }

      // Create a function with the code and run it
      const func = new Function('console', code)
      func(customConsole)

      setOutput(logs.join('\n'))
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

  return (
    <div className="my-8 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between bg-gray-100 px-4 py-2 dark:bg-gray-800">
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{title}</span>
        <div className="flex gap-2">
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
            CODE
          </label>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="h-48 w-full resize-none rounded border border-gray-200 bg-gray-50 p-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900"
            spellCheck={false}
          />
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
