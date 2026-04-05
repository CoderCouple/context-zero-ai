'use client'

import { useRef, useState } from 'react'
import siteMetadata from '@/data/siteMetadata'

const NewsletterForm = ({ title = 'Subscribe to the newsletter' }) => {
  const inputEl = useRef<HTMLInputElement>(null)
  const [error, setError] = useState(false)
  const [message, setMessage] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const subscribe = async (e: React.FormEvent) => {
    e.preventDefault()

    const email = inputEl.current?.value

    if (!email) {
      setError(true)
      setMessage('Please enter your email address')
      return
    }

    try {
      const res = await fetch(`/api/newsletter`, {
        body: JSON.stringify({
          email,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
      })

      const data = await res.json()

      if (res.status !== 201) {
        setError(true)
        setMessage(data.error || 'Something went wrong. Please try again.')
        return
      }

      setError(false)
      setMessage('Success! 🎉 You are now subscribed.')
      setSubscribed(true)
      if (inputEl.current) {
        inputEl.current.value = ''
      }
    } catch (error) {
      setError(true)
      setMessage('Something went wrong. Please try again.')
    }
  }

  return (
    <div>
      <div className="pb-1 text-lg font-semibold text-gray-800 dark:text-gray-100">{title}</div>
      <form className="flex flex-col gap-2 sm:flex-row" onSubmit={subscribe}>
        <div className="flex-1">
          <label htmlFor="email-input" className="sr-only">
            Email address
          </label>
          <input
            autoComplete="email"
            className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-primary-400"
            id="email-input"
            name="email"
            placeholder="Enter your email"
            ref={inputEl}
            required
            type="email"
            disabled={subscribed}
          />
        </div>
        <div className="flex">
          <button
            className={`rounded-md px-4 py-2 font-medium ${
              subscribed
                ? 'cursor-not-allowed bg-gray-400 text-gray-200 dark:bg-gray-600'
                : 'bg-primary-500 text-white hover:bg-primary-600 dark:bg-primary-600 dark:hover:bg-primary-700'
            } focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2 dark:ring-offset-black`}
            type="submit"
            disabled={subscribed}
          >
            {subscribed ? 'Thank you!' : 'Sign up'}
          </button>
        </div>
      </form>
      {message && (
        <div
          className={`mt-2 text-sm ${
            error ? 'text-red-500 dark:text-red-400' : 'text-green-500 dark:text-green-400'
          }`}
        >
          {message}
        </div>
      )}
    </div>
  )
}

export default NewsletterForm
