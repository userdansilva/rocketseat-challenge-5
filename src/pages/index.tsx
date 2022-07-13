import { GetStaticProps } from 'next';
import Link from 'next/link';
import { useState } from 'react';

import { FiCalendar, FiUser } from 'react-icons/fi';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps): JSX.Element {
  const [posts, setPosts] = useState<Post[]>(postsPagination.results);
  const [nextPage, setNextPage] = useState<string>(postsPagination.next_page);

  const loadMorePosts = async (): Promise<void> => {
    try {
      const result = await fetch(postsPagination.next_page);
      const newPost = (await result.json()) as PostPagination;
      setPosts(oldPosts => [...oldPosts, newPost.results[0]]);
      setNextPage(newPost.next_page);
    } catch {
      throw new Error('Fail!');
    }
  };

  return (
    <>
      <Link href="/">
        <div className={styles.logo}>
          <img src="/images/logo.svg" alt="logo" />
        </div>
      </Link>

      <main className={commonStyles.container}>
        {posts.map(post => {
          return (
            <div className={styles.card} key={post.uid}>
              <Link href={`/post/${post.uid}`}>
                <strong className={styles.title}>{post.data.title}</strong>
              </Link>
              <p className={styles.subtitle}>{post.data.subtitle}</p>
              <div className={styles.infoArea}>
                <div className={styles.info}>
                  <FiCalendar />
                  <span style={{ textTransform: 'capitalize' }}>
                    {format(
                      new Date(post.first_publication_date),
                      'dd MMM yyyy',
                      {
                        locale: ptBR,
                      }
                    )}
                  </span>
                </div>
                <div className={styles.info}>
                  <FiUser /> {post.data.author}
                </div>
              </div>
            </div>
          );
        })}
      </main>

      {nextPage && (
        <div className={commonStyles.container}>
          <button
            className={styles.loadMore}
            onClick={loadMorePosts}
            type="button"
          >
            Carregar mais posts
          </button>
        </div>
      )}
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient({});
  const postsResponse = await prismic.getByType('posts', {
    pageSize: 1,
  });

  return {
    props: {
      postsPagination: postsResponse,
    },
  };
};
