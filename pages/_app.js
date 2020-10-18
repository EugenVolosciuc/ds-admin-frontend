import { ProvideAuth } from 'utils/hoc/withAuth'

import 'antd/dist/antd.css'
import 'config/axios'
import 'styles/antd.less'
import 'styles/styles.scss'

const MyApp = ({ Component, pageProps }) => {
	return (
		<ProvideAuth>
			<Component {...pageProps} />
		</ProvideAuth>
	)
}

export default MyApp