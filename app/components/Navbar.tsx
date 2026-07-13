"use client";

import { useSession } from "next-auth/react";
import Link from "next/link"
import LogoutButton from "./LogoutButton";
const Navbar = () => {
    const {data: session} = useSession();
    return (
        <div>
            <nav className="navbar bg-base-100 shadow-md px-6 border-b">
                <div className="flex-1">
                    <Link href="/" className="btn btn-ghost text-xl font-bold">
                        ImageKit
                    </Link>
                </div>

                <div className="flex-none">
                    <ul className="menu menu-horizontal px-1 items-center gap-2">
                        {session?.user.name || session?.user.email ? (
                            <>
                                <li>
                                    <Link href={'/dashboard'} className="btn btn-primary btn-sm rounded-full  transition-all duration-300 hover:scale-105">
                                        Dashboard
                                    </Link>
                                </li>
                                <li>
                                    <Link href={'/upload'} className="btn btn-primary btn-sm rounded-full  transition-all duration-300 hover:scale-105">
                                        Upload
                                    </Link>
                                </li>
                                <li>
                                    <LogoutButton />
                                </li>
                            </>
                        ) : (
                            <>
                                <li>
                                    <Link href={'/login'} className="btn btn-ghost btn-sm">
                                        Login
                                    </Link>
                                </li>
                                <li>
                                    <Link href={'/register'} className="btn btn-primary btn-sm rounded-full  transition-all duration-300 hover:scale-105">
                                        Sign Up
                                    </Link>
                                </li>
                            </>
                        )}
                    </ul>
                </div>
            </nav>
        </div>
    )
}

export default Navbar
