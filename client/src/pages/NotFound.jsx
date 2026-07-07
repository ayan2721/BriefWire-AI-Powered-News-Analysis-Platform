import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <section className="mx-auto max-w-4xl rounded-[2rem] border border-stone-200 bg-white p-12 text-center shadow-sm">
      <p className="text-sm uppercase tracking-[0.4em] text-red-700">404</p>
      <h1 className="mt-6 font-serif text-5xl font-bold text-stone-900">Page not found</h1>
      <p className="mt-4 leading-7 text-stone-600">
        The page you are looking for does not exist. Return to the homepage or explore the AI news analyzer.
      </p>
      <Link
        to="/"
        className="mt-8 inline-flex rounded-full bg-red-700 px-6 py-3 font-medium text-white transition hover:bg-red-800"
      >
        Go Home
      </Link>
    </section>
  );
}

export default NotFound;
