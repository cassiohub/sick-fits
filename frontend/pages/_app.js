import App from 'next/app';
import { ApolloProvider } from 'react-apollo';

import withData from '../lib/withData';
import Page from '../components/Page';

class MyApp extends App {
  static async getInitialProps({ Component, ctx }) {
    const pageProps = Component.getInitialProps
      ? await Component.getInitialProps(ctx)
      : { query: ctx.query };

    return { pageProps };
  }

  render() {
    const { Component, apollo, pageProps } = this.props;

    return (
      <ApolloProvider client={apollo}>
        <Page>
          <Component { ...pageProps } />
        </Page>
      </ApolloProvider>
    );
  }
}

export default withData(MyApp);