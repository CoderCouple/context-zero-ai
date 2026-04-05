import Link from '@/components/Link'
import { genPageMetadata } from 'app/seo'
import { allBlogs } from 'contentlayer/generated'
import { allCoreContent } from 'pliny/utils/contentlayer'

export const metadata = genPageMetadata({
  title: 'Series',
  description: 'All blog series - structured learning paths and comprehensive guides',
})

// Define all available series
const seriesList = [
  {
    id: 'audio-deeplearning',
    title: 'Deep Learning for Audio',
    description:
      'A comprehensive guide to audio processing with deep learning, from fundamentals to advanced techniques',
    tag: 'audio-deeplearning',
    icon: '🎵',
    color: 'bg-blue-50 dark:bg-blue-900/20',
    borderColor: 'border-blue-200 dark:border-blue-800',
    status: 'active',
    totalChapters: 10,
    href: '/series/audio-deeplearning',
  },
  // Add more series here as you create them
  {
    id: 'llm-fundamentals',
    title: 'Large Language Models Fundamentals',
    description:
      'Understanding the architecture, training, and deployment of Large Language Models',
    tag: 'llm-fundamentals',
    icon: '🤖',
    color: 'bg-green-50 dark:bg-green-900/20',
    borderColor: 'border-green-200 dark:border-green-800',
    status: 'coming-soon',
    totalChapters: 8,
    href: '/series/llm-fundamentals',
  },
  {
    id: 'computer-vision',
    title: 'Computer Vision with Deep Learning',
    description: 'From image classification to object detection and segmentation',
    tag: 'computer-vision',
    icon: '👁️',
    color: 'bg-purple-50 dark:bg-purple-900/20',
    borderColor: 'border-purple-200 dark:border-purple-800',
    status: 'coming-soon',
    totalChapters: 12,
    href: '/series/computer-vision',
  },
]

export default function SeriesPage() {
  const posts = allCoreContent(allBlogs)

  // Calculate published chapters for each series
  const seriesWithStats = seriesList.map((series) => {
    const seriesPosts = posts.filter((post) =>
      post.tags?.some((tag) => tag.toLowerCase() === series.tag)
    )
    return {
      ...series,
      publishedChapters: seriesPosts.length,
      latestPost: seriesPosts[0], // Most recent post
    }
  })

  const activeSeries = seriesWithStats.filter((s) => s.status === 'active')
  const comingSoonSeries = seriesWithStats.filter((s) => s.status === 'coming-soon')

  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      <div className="space-y-2 pb-8 pt-6 md:space-y-5">
        <h1 className="md:leading-14 text-3xl font-extrabold leading-9 tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl sm:leading-10 md:text-6xl">
          Series
        </h1>
        <p className="text-lg leading-7 text-gray-500 dark:text-gray-400">
          Structured learning paths and comprehensive guides on various topics
        </p>
      </div>

      <div className="py-12">
        {/* Active Series */}
        <div className="mb-12">
          <h2 className="mb-6 text-2xl font-bold leading-8 tracking-tight">Active Series</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {activeSeries.map((series) => (
              <Link key={series.id} href={series.href} className="group">
                <div
                  className={`h-full rounded-lg border ${series.borderColor} ${series.color} p-6 transition-all hover:shadow-lg`}
                >
                  <div className="mb-4 flex items-start justify-between">
                    <span className="text-4xl">{series.icon}</span>
                    <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
                      Active
                    </span>
                  </div>

                  <h3 className="mb-2 text-xl font-bold text-gray-900 group-hover:text-primary-600 dark:text-gray-100 dark:group-hover:text-primary-400">
                    {series.title}
                  </h3>

                  <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                    {series.description}
                  </p>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">
                      {series.publishedChapters}/{series.totalChapters} chapters
                    </span>
                    <span className="text-primary-600 group-hover:text-primary-700 dark:text-primary-400 dark:group-hover:text-primary-300">
                      View Series →
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-3 h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                    <div
                      className="h-2 rounded-full bg-primary-600 dark:bg-primary-400"
                      style={{
                        width: `${(series.publishedChapters / series.totalChapters) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Coming Soon Series */}
        {comingSoonSeries.length > 0 && (
          <div>
            <h2 className="mb-6 text-2xl font-bold leading-8 tracking-tight">Coming Soon</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {comingSoonSeries.map((series) => (
                <div
                  key={series.id}
                  className={`h-full rounded-lg border ${series.borderColor} ${series.color} p-6 opacity-75`}
                >
                  <div className="mb-4 flex items-start justify-between">
                    <span className="text-4xl grayscale">{series.icon}</span>
                    <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                      Coming Soon
                    </span>
                  </div>

                  <h3 className="mb-2 text-xl font-bold text-gray-700 dark:text-gray-300">
                    {series.title}
                  </h3>

                  <p className="mb-4 text-sm text-gray-500 dark:text-gray-500">
                    {series.description}
                  </p>

                  <div className="text-sm text-gray-400 dark:text-gray-600">
                    {series.totalChapters} chapters planned
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-12 rounded-lg bg-gray-50 p-6 dark:bg-gray-800">
          <h3 className="mb-2 text-lg font-semibold">Want to suggest a series?</h3>
          <p className="mb-4 text-gray-600 dark:text-gray-400">
            Have a topic you'd like to see covered in a comprehensive series? I'm always looking for
            new ideas to help the community learn.
          </p>
          <Link
            href="/profile"
            className="inline-flex items-center font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
          >
            Get in touch →
          </Link>
        </div>
      </div>
    </div>
  )
}
