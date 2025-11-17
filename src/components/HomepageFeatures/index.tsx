import type {ReactNode} from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  Svg: React.ComponentType<React.ComponentProps<'svg'>>;
  description: ReactNode;
};

const FeatureList: FeatureItem[] = [
  {
    title: '统一规范',
    Svg: require('@site/static/img/undraw_docusaurus_mountain.svg').default,
    description: (
      <>
        为影视、音频、图书、漫画等不同类型的媒体提供统一的规范框架，
        简化多媒体数据采集的开发流程。
      </>
    ),
  },
  {
    title: '灵活可扩展',
    Svg: require('@site/static/img/undraw_docusaurus_tree.svg').default,
    description: (
      <>
        通过管道机制应对各种复杂场景，轻松添加新的媒体类型和处理步骤，
        使用简洁的 <code>TOML</code> 格式配置。
      </>
    ),
  },
  {
    title: '类型安全',
    Svg: require('@site/static/img/undraw_docusaurus_react.svg').default,
    description: (
      <>
        提供完整的 JSON Schema 定义和类型检查，
        确保规则配置的正确性和可维护性。
      </>
    ),
  },
];

function Feature({title, Svg, description}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
