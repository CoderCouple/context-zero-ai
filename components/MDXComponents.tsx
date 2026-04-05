import TOCInline from 'pliny/ui/TOCInline'
import Pre from 'pliny/ui/Pre'
import BlogNewsletterForm from 'pliny/ui/BlogNewsletterForm'
import type { MDXComponents } from 'mdx/types'
import Image from './Image'
import CustomLink from './Link'
import TableWrapper from './TableWrapper'
import CodePlayground from './MDXComponents/CodePlayground'
import InteractiveChart from './MDXComponents/InteractiveChart'
import Quiz from './MDXComponents/Quiz'
import Tabs from './MDXComponents/Tabs'
import AudioPlayer from './MDXComponents/AudioPlayer'
import WaveVisualizer from './MDXComponents/WaveVisualizer'
import SamplingVisualizer from './MDXComponents/SamplingVisualizer'
import PythonSimulator from './MDXComponents/PythonSimulatorEnhanced'
import WaveTypeDiagram from './MDXComponents/WaveTypeDiagram'

export const components: MDXComponents = {
  Image,
  TOCInline,
  a: CustomLink,
  pre: Pre,
  table: TableWrapper,
  BlogNewsletterForm,
  CodePlayground,
  InteractiveChart,
  Quiz,
  Tabs,
  AudioPlayer,
  WaveVisualizer,
  SamplingVisualizer,
  PythonSimulator,
  WaveTypeDiagram,
}
