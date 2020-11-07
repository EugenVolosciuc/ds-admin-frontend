import { ProvideAuth } from 'utils/hoc/withAuth'
import ProvideSchool from 'utils/contexts/schoolContext'
import { appWithTranslation } from 'i18n'
import 'config/axios'
import 'styles/package-styles.less'
import 'styles/styles.less'

const DSAdmin = ({ Component, pageProps }) => {
	return (
		<ProvideAuth>
			<ProvideSchool>
				<Component {...pageProps} />
			</ProvideSchool>
		</ProvideAuth>
	)
}

export default appWithTranslation(DSAdmin)