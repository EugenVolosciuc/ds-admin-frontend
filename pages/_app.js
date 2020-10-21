
import { ProvideAuth } from 'utils/hoc/withAuth'
import { appWithTranslation } from 'i18n'

import 'antd/dist/antd.css'
import 'config/axios'
import 'styles/styles.less'

const MyApp = ({ Component, pageProps }) => {
	return (
		<ProvideAuth>
			<Component {...pageProps} />
		</ProvideAuth>
	)
}

export default appWithTranslation(MyApp)