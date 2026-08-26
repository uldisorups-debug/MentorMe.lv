import { createNavigation } from 'next-intl/navigation'
import { routing } from './routing'

/**
 * Šos lieto parasto next/link un next/navigation vietā — tie paši
 * pieliek valodas prefiksu, kur tas vajadzīgs.
 */
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing)
