import type { HomePageView } from './home-page.type'

export const HEADLINE = 'Charts your team can actually build'

export const SUBHEADLINE =
  'Upload your data, pick what you want to see. InsightFlow guides you through every step — no dropdowns to decode, no chart-builder jargon. Just the chart you wanted, fast.'

export const FEATURES: HomePageView['features'] = [
  {
    title: 'Upload your data',
    description: 'CSV or Excel. We figure out the types.',
    icon: 'upload',
  },
  {
    title: 'Pick what to see',
    description: 'Guided four-step flow. No jargon.',
    icon: 'chart',
  },
  {
    title: 'Done',
    description: 'Live preview at every step. Always accurate.',
    icon: 'check',
  },
]
