import { ProvideAuth } from 'utils/hoc/withAuth'

import { appWithTranslation } from 'i18n'
import 'antd/dist/antd.css'
import 'config/axios'
import 'styles/styles.less'

const DSAdmin = ({ Component, pageProps }) => {
	return (
		<ProvideAuth>
			<Component {...pageProps} />
		</ProvideAuth>
	)
}

export default appWithTranslation(DSAdmin)