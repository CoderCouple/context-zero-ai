import { Authors, allAuthors } from 'contentlayer/generated'
import { MDXLayoutRenderer } from 'pliny/mdx-components'
import { coreContent } from 'pliny/utils/contentlayer'
import { genPageMetadata } from 'app/seo'
import Image from '@/components/Image'
import Link from '@/components/Link'
import SocialIcon from '@/components/social-icons'
import { Mail } from '@/components/social-icons/icons'
import siteMetadata from '@/data/siteMetadata'

export const metadata = genPageMetadata({ title: 'Profile' })

const skills = [
  'Python',
  'TypeScript',
  'JavaScript',
  'Java',
  'React',
  'Next.js',
  'Node.js',
  'LLMs & AI Agents',
  'System Design',
  'AWS',
  'Distributed Systems',
  'PostgreSQL',
  'Vector Databases',
]

const experience = [
  {
    title: 'CEO & Founder',
    company: 'Octopod AI',
    dates: '2025 – Present',
    description:
      'Building applied-AI products at the intersection of agents, memory, and developer tooling.',
  },
  {
    title: 'Member of Technical Staff',
    company: 'eBay',
    dates: 'Oct 2023 – Present',
    description:
      'Working on full-stack systems for one of the largest commerce platforms in the world.',
  },
  {
    title: 'Senior Software Engineer',
    company: 'Amazon Music',
    dates: 'Nov 2021 – Jul 2023',
    description:
      'Shipped backend services powering personalization and recommendations for Amazon Music.',
  },
  {
    title: 'Senior Software Engineer',
    company: 'Roku',
    dates: 'May 2021 – Oct 2021',
    description: 'Worked on streaming infrastructure for the Roku platform.',
  },
  {
    title: 'Software Engineer',
    company: 'Yahoo',
    dates: 'Jan 2019 – Mar 2021',
    description: 'Built and maintained services across Yahoo properties.',
  },
]

const projects = [
  {
    name: 'Fulloop AI',
    description: 'LLM-powered technical interview platform.',
  },
  {
    name: 'ContextZero AI',
    description: 'Hierarchical long-term memory system for AI agents.',
  },
  {
    name: 'Octoflash AI',
    description: 'AI-powered animation generator.',
  },
  {
    name: 'IncidentZero AI',
    description: 'Autonomous incident investigation agent built on MCP.',
  },
]

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
          <div className="pt-1 text-sm text-gray-500 dark:text-gray-400">
            San Francisco Bay Area
          </div>
          <div className="flex space-x-3 pt-6">
            <a
              href="https://suniltiwari.io/contact"
              className="text-sm text-gray-500 transition hover:text-gray-600"
            >
              <span className="sr-only">mail</span>
              <Mail className="h-8 w-8 fill-current text-gray-700 hover:text-primary-500 dark:text-gray-200 dark:hover:text-primary-400" />
            </a>
            <SocialIcon kind="github" href={siteMetadata.github} />
            <SocialIcon kind="linkedin" href={siteMetadata.linkedin} />
            <SocialIcon kind="x" href={siteMetadata.x} />
          </div>
          <Link
            href="https://www.suniltiwari.io/"
            className="mt-4 text-sm text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
          >
            suniltiwari.io →
          </Link>
        </div>
        <div className="prose max-w-none pb-8 pt-8 dark:prose-invert xl:col-span-2">
          <div className="mb-8">
            <h2 className="text-2xl font-bold leading-8 tracking-tight text-gray-900 dark:text-gray-100">
              About Me
            </h2>
            <MDXLayoutRenderer code={author.body.code} />
          </div>

          <div className="mt-8 space-y-8">
            <div>
              <h2 className="mb-4 text-2xl font-bold leading-8 tracking-tight text-gray-900 dark:text-gray-100">
                Skills
              </h2>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
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
              <h2 className="mb-4 text-2xl font-bold leading-8 tracking-tight text-gray-900 dark:text-gray-100">
                Experience
              </h2>
              <div className="space-y-4">
                {experience.map((role) => (
                  <div
                    key={`${role.company}-${role.title}`}
                    className="border-l-4 border-primary-500 pl-4"
                  >
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">{role.title}</h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      {role.company} • {role.dates}
                    </p>
                    <p className="mt-2">{role.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="mb-4 text-2xl font-bold leading-8 tracking-tight text-gray-900 dark:text-gray-100">
                Education
              </h2>
              <div className="space-y-4">
                <div className="border-l-4 border-primary-500 pl-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                    M.S. Computer Software Engineering
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    San José State University • GPA 3.76
                  </p>
                </div>
                <div className="border-l-4 border-primary-500 pl-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                    B.E. Information Technology
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">VESIT, Mumbai</p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="mb-4 text-2xl font-bold leading-8 tracking-tight text-gray-900 dark:text-gray-100">
                Recent Projects
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                {projects.map((project) => (
                  <div
                    key={project.name}
                    className="rounded-lg border border-gray-200 p-4 dark:border-gray-700"
                  >
                    <h3 className="mb-2 font-semibold text-gray-900 dark:text-gray-100">
                      {project.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {project.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="mb-4 text-2xl font-bold leading-8 tracking-tight text-gray-900 dark:text-gray-100">
                Get in Touch
              </h2>
              <p className="mb-4">
                I'm always interested in hearing about new opportunities and exciting projects. Feel
                free to reach out if you'd like to connect!
              </p>
              <a
                href="https://suniltiwari.io/contact"
                className="inline-flex items-center rounded-md bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-600 dark:bg-primary-600 dark:hover:bg-primary-700"
              >
                Send me an email
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
