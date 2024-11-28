'use client'

import { usePathname } from 'next/navigation';
import '@styles/LeftAside.css'
import clsx from 'clsx';

import Link from 'next/link'
export default function LeftAside() {
    const pathname = usePathname();
    return (
        <>
            <Link href={'/inventory'} className={clsx('Link', { 'activeLink': pathname === '/inventory', })}>Inventory</Link >
            <Link href={'/digit-recognition'} className={clsx('Link', { 'activeLink': pathname === '/digit-recognition', })}>Digit Recognition</Link >
            <Link href={'/emotion-detection'} className={clsx('Link', { 'activeLink': pathname === '/emotion-detection', })}>Emotion Detection</Link >
            <span className={'Link'}>Coming soon!</span >
            <span className={'Link'}>Coming soon!</span >
            <span className={'Link'}>Coming soon!</span >
        </>

    )
}