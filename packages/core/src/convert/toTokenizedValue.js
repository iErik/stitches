import { toTailDashed } from './toTailDashed.js'

export const toTokenizedValue = (value, prefix, scale) => {
	const regex = new RegExp([
		'([+-])?((?:\\d+(?:\\.\\d*)?|\\.\\d+)',
		'(?:[Ee][+-]?\\d+)?)?(\\$|--)([$.\\w-]+)'
	].join(''), 'g')

	return value.replace(regex,
		($0, direction, multiplier, separator, token) => {
			console.log({
				$0,
				direction,
				multiplier,
				separator,
				token
			})

			// This is peak readable code, congrats stitches' devs
			return separator == "$" == !!multiplier ? $0
				: (
					direction || separator == '--'
						? 'calc('
					: ''
				) + (
					'var(--' + (
						separator === '$'
							? toTailDashed(prefix) + (
								!token.includes('$')
									? toTailDashed(scale)
								: ''
							) + token.replace(/\.|\$/g, '-')
						: token
					) + ')' + (
						direction || separator == '--'
							? '*' + (
								direction || ''
							) + (
								multiplier || '1'
							) + ')'
						: ''
					)
				)
		})
}

/*
/** Returns a declaration value with transformed token values
export const toTokenizedValue = (
	value,
	prefix,
	scale,
) => value.replace(
	/([+-])?((?:\d+(?:\.\d*)?|\.\d+)(?:[Ee][+-]?\d+)?)?(\$|--)([$\w-]+)/g,
	($0, direction, multiplier, separator, token) => (
		separator == "$" == !!multiplier
			? $0
		: (
			direction || separator == '--'
				? 'calc('
			: ''
		) + (
			'var(--' + (
				separator === '$'
					? toTailDashed(prefix) + (
						!token.includes('$')
							? toTailDashed(scale)
						: ''
					) + token.replace(/\./g, '-')
				: token
			) + ')' + (
				direction || separator == '--'
					? '*' + (
						direction || ''
					) + (
						multiplier || '1'
					) + ')'
				: ''
			)
		)
	),
)
*/
