import {
  MousePointerClickIcon,
  GlobeIcon,
  PenLineIcon,
  TextSelectIcon,
} from 'lucide-react'

export const mockData = [
  {
    type: 'browse',
    selector: 'url',
    value: 'https://google.com',
    icon: GlobeIcon,
  },
  {
    type: 'form-edit',
    selector: 'input',
    value: 'Hello, World!',
    icon: PenLineIcon,
  },
  {
    type: 'click',
    selector: 'button',
    value: 'Search',
    icon: MousePointerClickIcon,
  },
  {
    type: 'click',
    selector: 'a',
    value: 'Learn more',
    icon: MousePointerClickIcon,
  },
  {
    type: 'select',
    selector: 'p',
    value: 'first paragraph',
    icon: TextSelectIcon,
  },
]
