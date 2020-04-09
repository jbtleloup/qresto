import React, { useContext, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import fetchSwal from '../lib/fetchSwal';
import { UserContext } from './UserContext';

export default ({ children }) => {
  const {
    state: { isLoggedIn },
    dispatch,
  } = useContext(UserContext);
  const [isOpen, setIsOpen] = useState(false);
  const handleLogout = (event) => {
    event.preventDefault();
    fetchSwal.delete('/api/session')
      .then((data) => data.ok !== false && dispatch({ type: 'clear' }));
  };
  return (
    <>
      <Head>
        <title>Next.js + MongoDB App</title>
        <meta
          key="viewport"
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />
        <meta
          name="description"
          content="nextjs-mongodb-app is a continously developed app built with Next.JS and MongoDB. This project goes further and attempts to integrate top features as seen in real-life apps."
        />
        <meta property="og:title" content="Next.js + MongoDB App"/>
        <meta
          property="og:description"
          content="nextjs-mongodb-app is a continously developed app built with Next.JS and MongoDB. This project goes further and attempts to integrate top features as seen in real-life apps."
        />
        <meta
          property="og:image"
          content="https://repository-images.githubusercontent.com/201392697/5d392300-eef3-11e9-8e20-53310193fbfd"
        />
      </Head>
      <header
        className="bg-red-800 sm:flex sm:justify-between sm:px-4 sm:py-3 sm:items-center text-white"
      >
        <div className="flex items-center justify-between px-4 py-3 sm:p-0">
          <div>
            <img className="h-16 object-contain" src="/logo.png" alt="logo"/>
          </div>
          <Link href="/">
            <a>
              <h1 className="sm:text-4xl text-2xl">Qresto</h1>
            </a>
          </Link>
          <div className="sm:hidden">
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="block focus:outline-none"
            >
              <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24">
                <path
                  className={`${isOpen ? 'block' : 'hidden'}`}
                  fill-rule="evenodd"
                  d="M18.278 16.864a1 1 0 0 1-1.414 1.414l-4.829-4.828-4.828 4.828a1 1 0 0 1-1.414-1.414l4.828-4.829-4.828-4.828a1 1 0 0 1 1.414-1.414l4.829 4.828 4.828-4.828a1 1 0 1 1 1.414 1.414l-4.828 4.829 4.828 4.828z"/>
                <path
                  className={`${!isOpen ? 'block' : 'hidden'}`}
                  fill-rule="evenodd"
                  d="M4 5h16a1 1 0 0 1 0 2H4a1 1 0 1 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2z"/>
              </svg>
            </button>
          </div>
        </div>
        <div className={`${isOpen ? 'block' : 'hidden'} sm:flex px-2 pt-2 pb-4`}>
          {!isLoggedIn ? (
            <>
              <Link href="/login">
                <a>Sign in</a>
              </Link>
              <Link href="/signup">
                <a>Sign up</a>
              </Link>
            </>
          ) : (
            <>
              <Link href="/menu">
                <a
                  className="block rounded px-2 py-1 font-semibold hover:bg-gray-800 sm:mt-0 sm:ml-2"
                >
                  Menus
                </a>
              </Link>
              <Link href="/dish">
                <a
                  className="block rounded px-2 py-1 font-semibold hover:bg-gray-800 sm:mt-0 sm:ml-2"
                >
                  Plats
                </a>
              </Link>
              <Link href="/dish/add">
                <a
                  className="block rounded px-2 py-1 font-semibold hover:bg-gray-800 sm:mt-0 sm:ml-2"
                >
                  Ajouter Plat
                </a>
              </Link>
              <Link href="/profile">
                <a
                  className="block rounded px-2 py-1 font-semibold hover:bg-gray-800 sm:mt-0 sm:ml-2"
                >
                  Profile
                </a>
              </Link>
              <a
                href="/"
                role="button"
                onClick={handleLogout}
                className="block rounded px-2 py-1 font-semibold hover:bg-gray-800 sm:mt-0 sm:ml-2"
              >
                Logout
              </a>
            </>
          )}
        </div>
      </header>

      <main className="bg-gray-200 font-sans">{children}</main>

      <footer className="bg-red-800 text-white sm:p-8 p-0 mt-10">
        <p className="text-center">Q Resto Tout droits Réservés 2020</p>
      </footer>
    </>
  );
};
