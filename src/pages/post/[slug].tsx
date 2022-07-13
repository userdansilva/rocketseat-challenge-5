import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import { RichText } from 'prismic-dom';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import Header from '../../components/Header';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps): JSX.Element {
  const router = useRouter();
  if (router.isFallback) return <div>Carregando...</div>;

  const amountOfWords = post.data.content.reduce((acc, curPost) => {
    const headingCounter = curPost.heading.split(/[,.\s]/).length;
    const bodyCounter = RichText.asText(curPost.body).split(/[,.\s]/).length;

    const totalWordBySection = headingCounter + bodyCounter;

    return acc + totalWordBySection;
  }, 0);

  const time = Math.ceil(amountOfWords / 200);

  return (
    <>
      <Header />

      {post.data.banner && (
        <img
          src={post.data.banner.url}
          alt="banner"
          width="100%"
          className={styles.banner}
        />
      )}

      <main className={commonStyles.container}>
        <h1 className={styles.title}>{post.data.title}</h1>
        <div className={styles.infoContainer}>
          <div className={styles.info}>
            <FiCalendar />
            <span style={{ textTransform: 'capitalize' }}>
              {format(new Date(post.first_publication_date), 'dd MMM yyyy', {
                locale: ptBR,
              })}
            </span>
          </div>
          <div className={styles.info}>
            <FiUser />
            {post.data.author}
          </div>
          <div className={styles.info}>
            <FiClock />
            {`${time} min`}
          </div>
        </div>
        <div>
          {post.data.content.map(({ heading, body }) => {
            return (
              <div key={heading} style={{ marginBottom: '3.5rem' }}>
                {heading && <h2 className={styles.heading}>{heading}</h2>}
                <div
                  // eslint-disable-next-line react/no-danger
                  dangerouslySetInnerHTML={{
                    __html: RichText.asHtml(body),
                  }}
                />
              </div>
            );
          })}
        </div>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient({});
  const posts = await prismic.getByType('posts');

  const paths = posts.results.map(post => {
    return {
      params: {
        slug: post.uid,
      },
    };
  });

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;

  const prismic = getPrismicClient({});
  const post = await prismic.getByUID('posts', slug as string);

  return {
    props: {
      post,
    },
  };
};
