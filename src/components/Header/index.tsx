import Link from 'next/link';
import styles from './header.module.scss';

export default function Header(): JSX.Element {
  return (
    <Link href="/">
      <div className={styles.logo}>
        <img src="/images/logo.svg" alt="logo" />
      </div>
    </Link>
  );
}
