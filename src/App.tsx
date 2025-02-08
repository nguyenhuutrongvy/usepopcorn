import { ReactNode, useEffect, useRef, useState } from "react";
import StarRating from "./StarRating";
import "./styles.css";
import { useKey } from "./useKey";
import useLocalStorageState from "./useLocalStorageState";
import { useMovies } from "./useMovies";

type Movie = {
  imdbID?: string;
  Title?: string;
  Year?: string;
  Poster?: string;
};

type WatchedMovie = Movie & {
  runtime?: number;
  imdbRating?: number;
  userRating?: number;
  countRatingDecisions?: number;
};

type MovieDetails = Movie & {
  Runtime?: string;
  imdbRating?: string;
  Plot?: string;
  Released?: string;
  Actors?: string;
  Director?: string;
  Genre?: string;
};

const KEY = "48531ae3";

const average = (arr: number[]) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

export default function App() {
  const [query, setQuery] = useState("");
  const [watched, setWatched] = useLocalStorageState<WatchedMovie[]>(
    [],
    "watched"
  );
  const [selectedId, setSelectedId] = useState("");

  const { movies, isLoading, error } = useMovies(query);

  function handleSelectMovie(id: string) {
    setSelectedId((selectedId) => (selectedId === id ? "" : id));
  }

  function handleCloseMovie() {
    setSelectedId("");
  }

  function handleAddWatched(movie: WatchedMovie) {
    setWatched((watched: WatchedMovie[]) => [...watched, movie]);
  }

  function handleDeleteWatched(id: string) {
    setWatched((watched: WatchedMovie[]) =>
      watched.filter((w) => w.imdbID !== id)
    );
  }

  return (
    <>
      <NavBar>
        <Search query={query} setQuery={setQuery} />
        <NumResults movies={movies} />
      </NavBar>
      <Main>
        <Box>
          {isLoading && <Loader />}
          {error && <ErrorMessage message={error} />}
          {!isLoading && !error && (
            <MovieList movies={movies} onSelectMovie={handleSelectMovie} />
          )}
        </Box>
        <Box>
          {selectedId ? (
            <MovieDetails
              selectedId={selectedId}
              watched={watched}
              onCloseMovie={handleCloseMovie}
              onAddWatched={handleAddWatched}
            />
          ) : (
            <>
              <WatchedSummary watched={watched} />
              <WatchedMoviesList
                watched={watched}
                onDeleteWatched={handleDeleteWatched}
              />
            </>
          )}
        </Box>
      </Main>
    </>
  );
}

function Loader() {
  return <p className="loader">Loading...</p>;
}

function ErrorMessage({ message }: { message: string }) {
  return (
    <p className="error">
      <span>⛔</span> {message}
    </p>
  );
}

function NavBar({ children }: { children?: ReactNode }) {
  return (
    <nav className="nav-bar">
      <Logo />
      {children}
    </nav>
  );
}

function Logo() {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>usePopcorn</h1>
    </div>
  );
}

function Search({
  query,
  setQuery,
}: {
  query: string;
  setQuery: (query: string) => void;
}) {
  const inputEl = useRef<HTMLInputElement>(null);

  useKey("Enter", () => {
    if (document.activeElement === inputEl.current) {
      return;
    }

    inputEl?.current?.focus();
    setQuery("");
  });

  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      ref={inputEl}
    />
  );
}

function NumResults({ movies }: { movies: Movie[] }) {
  return (
    <p className="num-results">
      Found <strong>{movies.length}</strong> results
    </p>
  );
}

function Main({ children }: { children?: ReactNode }) {
  return <main className="main">{children}</main>;
}

function Box({ children }: { children?: ReactNode }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="box">
      <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? "–" : "+"}
      </button>
      {isOpen && children}
    </div>
  );
}

function MovieList({
  movies,
  onSelectMovie,
}: {
  movies: Movie[];
  onSelectMovie: (id: string) => void;
}) {
  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <Movie movie={movie} key={movie.imdbID} onSelectMovie={onSelectMovie} />
      ))}
    </ul>
  );
}

function Movie({
  movie,
  onSelectMovie,
}: {
  movie: Movie;
  onSelectMovie: (id: string) => void;
}) {
  return (
    <li onClick={() => onSelectMovie(movie.imdbID || "")}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}

function WatchedSummary({ watched }: { watched: WatchedMovie[] }) {
  const avgImdbRating: number = average(
    watched.map((movie) => movie.imdbRating ?? 0)
  );
  const avgUserRating: number = average(
    watched.map((movie) => movie.userRating ?? 0)
  );
  const avgRuntime: number = average(
    watched.map((movie) => movie.runtime ?? 0)
  );

  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating.toFixed(2)}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating.toFixed(2)}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime.toFixed(2)} min</span>
        </p>
      </div>
    </div>
  );
}

function WatchedMoviesList({
  watched,
  onDeleteWatched,
}: {
  watched: WatchedMovie[];
  onDeleteWatched: (id: string) => void;
}) {
  return (
    <ul className="list">
      {watched.map((movie) => (
        <WatchedMovie
          key={movie.imdbID}
          movie={movie}
          onDeleteWatched={onDeleteWatched}
        />
      ))}
    </ul>
  );
}

function MovieDetails({
  selectedId,
  watched,
  onCloseMovie,
  onAddWatched,
}: {
  selectedId: string;
  watched: WatchedMovie[];
  onCloseMovie: () => void;
  onAddWatched: (movie: WatchedMovie) => void | null;
}) {
  const [movie, setMovie] = useState<MovieDetails>({});
  const [isLoading, setIsLoading] = useState(false);
  const [userRating, setUserRating] = useState(0);

  const countRef = useRef(0);

  useEffect(() => {
    if (userRating) {
      countRef.current++;
    }
  }, [userRating]);

  const watchedMovie = watched.find((w) => w.imdbID === selectedId);

  const {
    Title: title,
    Year: year,
    Poster: poster,
    Runtime: runtime,
    imdbRating,
    Plot: plot,
    Released: released,
    Actors: actors,
    Director: director,
    Genre: genre,
  } = movie;

  function handleAdd() {
    const newWatchedMovie: WatchedMovie = {
      imdbID: selectedId,
      Title: title,
      Year: year,
      Poster: poster,
      runtime: Number(runtime?.split(" ")[0]),
      imdbRating: Number(imdbRating),
      userRating,
      countRatingDecisions: countRef.current,
    };

    onAddWatched(newWatchedMovie);
    onCloseMovie();
  }

  useKey("Escape", onCloseMovie);

  useEffect(() => {
    setIsLoading(true);
    async function getMovieDetails() {
      const res = await fetch(
        `https://www.omdbapi.com/?apikey=${KEY}&i=${selectedId}`
      );
      const data = await res.json();
      setMovie(data);
      setIsLoading(false);
    }
    getMovieDetails();
  }, [selectedId]);

  useEffect(() => {
    if (!title) {
      return;
    }
    document.title = `Movie | ${title}`;

    return () => {
      document.title = "usePopcorn";
    };
  }, [title]);

  return isLoading ? (
    <Loader />
  ) : (
    <div className="details">
      <header>
        <button className="btn-back" onClick={onCloseMovie}>
          &larr;
        </button>
        <img src={poster} alt={`Poster of ${title} movie`} />
        <div className="details-overview">
          <h2>{title}</h2>
          <p>
            {released} &bull; {runtime}
          </p>
          <p>{genre}</p>
          <p>
            <span>⭐</span>
            {imdbRating} Imdb rating
          </p>
        </div>
      </header>
      <section>
        <div className="rating">
          {watchedMovie ? (
            <p>
              You rated with movie {watchedMovie.userRating} <span>⭐</span>
            </p>
          ) : (
            <>
              <StarRating
                maxRating={10}
                size={24}
                onSetRating={setUserRating}
              />
              {userRating > 0 && (
                <button className="btn-add" onClick={handleAdd}>
                  Add to list
                </button>
              )}
            </>
          )}
        </div>
        <p>
          <em>{plot}</em>
        </p>
        <p>Starring {actors}</p>
        <p>Directed by {director}</p>
      </section>
    </div>
  );
}

function WatchedMovie({
  movie,
  onDeleteWatched,
}: {
  movie: WatchedMovie;
  onDeleteWatched: (id: string) => void;
}) {
  return (
    <li key={movie.imdbID}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p>
        <button
          className="btn-delete"
          onClick={() => onDeleteWatched(movie.imdbID!)}
        >
          X
        </button>
      </div>
    </li>
  );
}
