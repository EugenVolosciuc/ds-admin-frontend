import { Button } from 'antd'

import Link from 'next/link'

const Homepage = () => {
	return (
		<div>
			<p>This is the homepage</p>
			<Link href="/login" as="/login"><Button>Login</Button></Link>
		</div>
	)
}

export default Homepage