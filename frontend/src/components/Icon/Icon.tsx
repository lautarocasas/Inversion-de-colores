import type { JSX } from 'react'
import * as icons from './index.ts'

export interface IconProps {
  width?: string
  height?: string
  fillColor?: string
  name: keyof typeof icons
}

const Icon = ({ name, ...props }: IconProps): JSX.Element => {
  const Component = icons[name]
  return <Component {...props} />
}

export default Icon