'use client'

import { useState } from 'react'
import { Check, X } from 'lucide-react'

interface Question {
  question: string
  options: string[]
  correct: number
  explanation?: string
}

interface QuizProps {
  questions: Question[]
  title?: string
}

export default function Quiz({ questions, title = 'Interactive Quiz' }: QuizProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [score, setScore] = useState(0)
  const [answered, setAnswered] = useState<boolean[]>(new Array(questions.length).fill(false))

  const handleAnswer = (optionIndex: number) => {
    if (answered[currentQuestion]) return

    setSelectedAnswer(optionIndex)
    const isCorrect = optionIndex === questions[currentQuestion].correct

    if (isCorrect) {
      setScore(score + 1)
    }

    const newAnswered = [...answered]
    newAnswered[currentQuestion] = true
    setAnswered(newAnswered)
  }

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setSelectedAnswer(null)
    } else {
      setShowResult(true)
    }
  }

  const resetQuiz = () => {
    setCurrentQuestion(0)
    setSelectedAnswer(null)
    setShowResult(false)
    setScore(0)
    setAnswered(new Array(questions.length).fill(false))
  }

  if (showResult) {
    return (
      <div className="my-8 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="bg-gray-100 px-4 py-3 dark:bg-gray-800">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">{title}</h3>
        </div>
        <div className="p-8 text-center">
          <h2 className="mb-4 text-2xl font-bold">Quiz Complete!</h2>
          <p className="mb-6 text-lg">
            Your score:{' '}
            <span className="text-2xl font-bold text-blue-500">
              {score}/{questions.length}
            </span>
          </p>
          <div className="mb-6">
            <div className="h-4 w-full rounded-full bg-gray-200">
              <div
                className="h-4 rounded-full bg-blue-500 transition-all duration-500"
                style={{ width: `${(score / questions.length) * 100}%` }}
              />
            </div>
          </div>
          <button
            onClick={resetQuiz}
            className="rounded bg-blue-500 px-6 py-2 text-white transition-colors hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  const question = questions[currentQuestion]

  return (
    <div className="my-8 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between bg-gray-100 px-4 py-3 dark:bg-gray-800">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">{title}</h3>
        <span className="text-sm text-gray-500">
          Question {currentQuestion + 1} of {questions.length}
        </span>
      </div>

      <div className="p-6">
        <h3 className="mb-4 text-lg font-semibold">{question.question}</h3>

        <div className="space-y-3">
          {question.options.map((option, index) => {
            const isSelected = selectedAnswer === index
            const isCorrect = index === question.correct
            const showFeedback = answered[currentQuestion]

            return (
              <button
                key={index}
                onClick={() => handleAnswer(index)}
                disabled={answered[currentQuestion]}
                className={`w-full rounded-lg border p-3 text-left transition-all ${
                  showFeedback
                    ? isCorrect
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                      : isSelected
                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                        : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800'
                    : 'border-gray-200 bg-gray-50 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{option}</span>
                  {showFeedback && (
                    <>
                      {isCorrect && <Check className="h-5 w-5 text-green-500" />}
                      {isSelected && !isCorrect && <X className="h-5 w-5 text-red-500" />}
                    </>
                  )}
                </div>
              </button>
            )
          })}
        </div>

        {answered[currentQuestion] && question.explanation && (
          <div className="mt-4 rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
            <p className="text-sm">{question.explanation}</p>
          </div>
        )}

        {answered[currentQuestion] && (
          <button
            onClick={nextQuestion}
            className="mt-6 rounded bg-blue-500 px-6 py-2 text-white transition-colors hover:bg-blue-600"
          >
            {currentQuestion < questions.length - 1 ? 'Next Question' : 'See Results'}
          </button>
        )}
      </div>
    </div>
  )
}
