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

// Strip query params, hashes, anchor tags...
export const getBaseResourceURL = (urlString: string): string => {
  try {
    console.log(111, urlString)
    const url = new URL(urlString)
    return `${url.origin}${url.pathname}`
  } catch (e) {
    console.error(e)
    return urlString
  }
}
