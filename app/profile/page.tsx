import { Authors, allAuthors } from 'contentlayer/generated'
import { MDXLayoutRenderer } from 'pliny/mdx-components'
import { coreContent } from 'pliny/utils/contentlayer'
import { genPageMetadata } from 'app/seo'
import Image from '@/components/Image'
import Link from '@/components/Link'
import SocialIcon from '@/components/social-icons'
import siteMetadata from '@/data/siteMetadata'

export const metadata = genPageMetadata({ title: 'Profile' })

export default function ProfilePage() {
  const author = allAuthors.find((p) => p.slug === 'default') as Authors
  const mainContent = coreContent(author)

  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      <div className="space-y-2 pb-8 pt-6 md:space-y-5">
        <h1 className="md:leading-14 text-3xl font-extrabold leading-9 tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl sm:leading-10 md:text-6xl">
          Profile
        </h1>
      </div>
      <div className="items-start space-y-2 xl:grid xl:grid-cols-3 xl:gap-x-8 xl:space-y-0">
        <div className="flex flex-col items-center space-x-2 pt-8">
          {mainContent.avatar && (
            <Image
              src={mainContent.avatar}
              alt="avatar"
              width={192}
              height={192}
              className="h-48 w-48 rounded-full"
            />
          )}
          <h3 className="pb-2 pt-4 text-2xl font-bold leading-8 tracking-tight">
            {mainContent.name}
          </h3>
          <div className="text-gray-500 dark:text-gray-400">{mainContent.occupation}</div>
          <div className="text-gray-500 dark:text-gray-400">{mainContent.company}</div>
          <div className="flex space-x-3 pt-6">
            <SocialIcon kind="mail" href={`mailto:${siteMetadata.email}`} />
            <SocialIcon kind="github" href={siteMetadata.github} />
            <SocialIcon kind="linkedin" href={siteMetadata.linkedin} />
            <SocialIcon kind="x" href={siteMetadata.x} />
          </div>
        </div>
        <div className="prose max-w-none pb-8 pt-8 dark:prose-invert xl:col-span-2">
          <div className="mb-8">
            <h2 className="text-2xl font-bold leading-8 tracking-tight">About Me</h2>
            <MDXLayoutRenderer code={author.body.code} />
          </div>

          <div className="mt-8 space-y-8">
            <div>
              <h2 className="mb-4 text-2xl font-bold leading-8 tracking-tight">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {[
                  'JavaScript',
                  'TypeScript',
                  'React',
                  'Next.js',
                  'Node.js',
                  'Python',
                  'Tailwind CSS',
                ].map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full bg-primary-100 px-3 py-1 text-sm font-medium text-primary-800 dark:bg-primary-900 dark:text-primary-200"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h2 className="mb-4 text-2xl font-bold leading-8 tracking-tight">Experience</h2>
              <div className="space-y-4">
                <div className="border-l-4 border-primary-500 pl-4">
                  <h3 className="font-semibold">Senior Developer</h3>
                  <p className="text-gray-500 dark:text-gray-400">Company Name • 2020 - Present</p>
                  <p className="mt-2">
                    Working on cutting-edge web applications and leading development teams.
                  </p>
                </div>
                <div className="border-l-4 border-primary-500 pl-4">
                  <h3 className="font-semibold">Full Stack Developer</h3>
                  <p className="text-gray-500 dark:text-gray-400">Previous Company • 2018 - 2020</p>
                  <p className="mt-2">
                    Developed and maintained multiple client projects using modern web technologies.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="mb-4 text-2xl font-bold leading-8 tracking-tight">Recent Projects</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                  <h3 className="mb-2 font-semibold">Project One</h3>
                  <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
                    A full-stack web application built with Next.js and Node.js
                  </p>
                  <Link
                    href="#"
                    className="text-sm text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
                  >
                    View Project →
                  </Link>
                </div>
                <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                  <h3 className="mb-2 font-semibold">Project Two</h3>
                  <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
                    Mobile-first responsive design with advanced animations
                  </p>
                  <Link
                    href="#"
                    className="text-sm text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
                  >
                    View Project →
                  </Link>
                </div>
              </div>
            </div>

            <div>
              <h2 className="mb-4 text-2xl font-bold leading-8 tracking-tight">Get in Touch</h2>
              <p className="mb-4">
                I'm always interested in hearing about new opportunities and exciting projects. Feel
                free to reach out if you'd like to connect!
              </p>
              <Link
                href={`mailto:${siteMetadata.email}`}
                className="inline-flex items-center rounded-md bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-600 dark:bg-primary-600 dark:hover:bg-primary-700"
              >
                Send me an email
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
