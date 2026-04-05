import Link from '@/components/Link'
import Tag from '@/components/Tag'
import { genPageMetadata } from 'app/seo'
import { allBlogs } from 'contentlayer/generated'
import { allCoreContent, sortPosts } from 'pliny/utils/contentlayer'

export const metadata = genPageMetadata({
  title: 'Deep Learning for Audio Series',
  description:
    'A comprehensive guide to understanding and implementing deep learning techniques for audio processing and analysis',
})

const chapters = [
  {
    number: 0,
    title: 'Introduction to the Series',
    slug: 'audio-deeplearning-00-introduction',
    description: "Overview of what we'll cover in this deep learning for audio series",
    status: 'published',
  },
  {
    number: 1,
    title: 'Audio Fundamentals',
    slug: 'audio-deeplearning-01-fundamentals',
    description: 'Understanding sound waves, digital audio, sampling rates, and audio formats',
    status: 'published',
  },
  {
    number: 2,
    title: 'Signal Processing Basics',
    slug: 'audio-deeplearning-02-signal-processing',
    description: 'FFT, spectrograms, MFCCs, and other audio feature extraction techniques',
    status: 'published',
  },
  {
    number: 3,
    title: 'Introduction to Audio Deep Learning',
    slug: 'audio-deeplearning-03-intro-dl',
    description: 'Overview of neural networks for audio processing and common architectures',
    status: 'published',
  },
  {
    number: 4,
    title: 'Audio Classification with CNNs',
    slug: 'audio-deeplearning-04-classification',
    description: 'Building convolutional neural networks for audio classification tasks',
    status: 'coming-soon',
  },
  {
    number: 5,
    title: 'Speech Recognition Fundamentals',
    slug: 'audio-deeplearning-05-speech-recognition',
    description: 'Introduction to automatic speech recognition (ASR) systems',
    status: 'coming-soon',
  },
  {
    number: 6,
    title: 'Audio Generation with GANs',
    slug: 'audio-deeplearning-06-generation',
    description: 'Using generative models to create and synthesize audio',
    status: 'coming-soon',
  },
  {
    number: 7,
    title: 'Music Information Retrieval',
    slug: 'audio-deeplearning-07-mir',
    description: 'Extracting meaningful information from music using deep learning',
    status: 'coming-soon',
  },
  {
    number: 8,
    title: 'Real-time Audio Processing',
    slug: 'audio-deeplearning-08-realtime',
    description: 'Implementing efficient audio models for real-time applications',
    status: 'coming-soon',
  },
  {
    number: 9,
    title: 'Advanced Topics and Future Directions',
    slug: 'audio-deeplearning-09-advanced',
    description: 'Transformers for audio, self-supervised learning, and emerging trends',
    status: 'coming-soon',
  },
]

export default function AudioDeepLearningSeries() {
  const posts = allCoreContent(sortPosts(allBlogs))
  const seriesPosts = posts.filter((post) =>
    post.tags?.some((tag) => tag.toLowerCase() === 'audio-deeplearning')
  )

  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      <div className="space-y-2 pb-8 pt-6 md:space-y-5">
        <h1 className="md:leading-14 text-3xl font-extrabold leading-9 tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl sm:leading-10 md:text-6xl">
          Deep Learning for Audio
        </h1>
        <p className="text-lg leading-7 text-gray-500 dark:text-gray-400">
          A comprehensive series covering the fundamentals and advanced techniques of applying deep
          learning to audio processing, from basic signal processing to state-of-the-art models for
          speech recognition, music generation, and audio analysis.
        </p>
      </div>

      <div className="py-12">
        <div className="prose max-w-none dark:prose-invert">
          <h2 className="mb-4 text-2xl font-bold">About This Series</h2>
          <p className="mb-6">
            This series is designed for developers, researchers, and enthusiasts who want to
            understand and implement deep learning techniques for audio applications. We'll start
            with the fundamentals of audio and signal processing, then progressively explore various
            deep learning architectures and their applications in audio domain.
          </p>

          <h3 className="mb-4 text-xl font-semibold">What You'll Learn:</h3>
          <ul className="mb-6 list-disc pl-6">
            <li>Audio signal processing fundamentals and feature extraction</li>
            <li>Building and training neural networks for audio tasks</li>
            <li>Speech recognition and synthesis techniques</li>
            <li>Music information retrieval and generation</li>
            <li>Real-world audio applications and deployment strategies</li>
          </ul>

          <h3 className="mb-4 text-xl font-semibold">Prerequisites:</h3>
          <ul className="mb-8 list-disc pl-6">
            <li>Basic Python programming knowledge</li>
            <li>Familiarity with machine learning concepts (helpful but not required)</li>
            <li>Enthusiasm to learn about audio and AI!</li>
          </ul>
        </div>

        <h2 className="mb-8 text-2xl font-bold">Series Chapters</h2>

        <div className="space-y-4">
          {chapters.map((chapter) => {
            const post = seriesPosts.find((p) => p.slug === chapter.slug)
            const isPublished = post !== undefined

            return (
              <div
                key={chapter.number}
                className="group relative rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-3">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-800 dark:bg-primary-900 dark:text-primary-200">
                        {chapter.number}
                      </span>
                      {chapter.status === 'coming-soon' && (
                        <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                          Coming Soon
                        </span>
                      )}
                    </div>

                    {isPublished ? (
                      <Link href={`/blog/${chapter.slug}`} className="block">
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 dark:text-gray-100 dark:group-hover:text-primary-400">
                          Chapter {chapter.number}: {chapter.title}
                        </h3>
                      </Link>
                    ) : (
                      <h3 className="text-lg font-semibold text-gray-500 dark:text-gray-400">
                        Chapter {chapter.number}: {chapter.title}
                      </h3>
                    )}

                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      {chapter.description}
                    </p>

                    {isPublished && post && (
                      <div className="mt-3 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <time dateTime={post.date}>
                          {new Date(post.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </time>
                        {post.readingTime && <span>• {post.readingTime.text}</span>}
                      </div>
                    )}
                  </div>

                  {isPublished && (
                    <Link
                      href={`/blog/${chapter.slug}`}
                      className="ml-4 inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
                    >
                      Read
                      <svg
                        className="ml-1 h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </Link>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-12 rounded-lg bg-gray-50 p-6 dark:bg-gray-800">
          <h3 className="mb-2 text-lg font-semibold">Stay Updated</h3>
          <p className="text-gray-600 dark:text-gray-400">
            New chapters are being added regularly. Follow the blog to get notified when new content
            is published!
          </p>
        </div>
      </div>
    </div>
  )
}
