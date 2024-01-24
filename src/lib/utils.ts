import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { minimatch } from 'minimatch'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const addHttpsIfMissing = (url: string) => {
  if (!/^https?:\/\//i.test(url)) {
    return 'https://' + url
  }
  return url
}

export function isHostExcluded(excludeList: string[] = []) {
  const hostName = window.location.hostname

  return excludeList?.some((pattern) => minimatch(hostName, pattern))
}

export function log(...args: any) {
  if (process.env.NODE_ENV === 'development') {
    console.log(...args)
  }
}
