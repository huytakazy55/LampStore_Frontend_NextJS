"use client";

/**
 * Compatibility shim: maps react-router-dom APIs to Next.js equivalents.
 * This allows copied CRA components to work with minimal individual editing.
 */

import { useRouter, useParams as useNextParams, useSearchParams as useNextSearchParams, usePathname } from 'next/navigation';
import NextLink from 'next/link';

// useNavigate → returns a function compatible with react-router's navigate()
export function useNavigate() {
    const router = useRouter();
    return (pathOrDelta, options) => {
        if (typeof pathOrDelta === 'number') {
            if (pathOrDelta === -1) router.back();
            else router.push('/');
        } else {
            if (options?.replace) {
                router.replace(pathOrDelta);
            } else {
                router.push(pathOrDelta);
            }
        }
    };
}

// Re-export Next.js hooks under react-router names
export function useParams() {
    return useNextParams();
}

export function useSearchParams() {
    return useNextSearchParams();
}

// useLocation compat
export function useLocation() {
    const pathname = usePathname();
    return {
        pathname,
        search: typeof window !== 'undefined' ? window.location.search : '',
        hash: typeof window !== 'undefined' ? window.location.hash : '',
        state: null,
        key: 'default',
    };
}

// Link component — maps react-router's `to` prop to Next.js `href`
export function Link({ to, children, className, style, onClick, ...rest }) {
    return (
        <NextLink href={to || '/'} className={className} style={style} onClick={onClick} {...rest}>
            {children}
        </NextLink>
    );
}

// Outlet — not needed in Next.js (layout.jsx handles this)
export function Outlet({ children }) {
    return children || null;
}

// NavLink — simplified version (no active class detection)
export function NavLink({ to, children, className, style, ...rest }) {
    return (
        <NextLink href={to || '/'} className={className} style={style} {...rest}>
            {children}
        </NextLink>
    );
}
