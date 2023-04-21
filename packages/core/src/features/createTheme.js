import { ThemeToken } from '../ThemeToken.js'
import { createMemo } from '../utility/createMemo.js'

import { toHash } from '../convert/toHash.js'
import { toTailDashed } from '../convert/toTailDashed.js'
import { toTokenizedValue } from '../convert/toTokenizedValue.js'

const createCreateThemeFunctionMap = createMemo()

const isObject = (value) =>
	typeof value === 'object' && value !== null

/** Returns a function that applies a theme and returns tokens of that theme. */
export const createCreateThemeFunction = (
	config,
	sheet
) => (
	createCreateThemeFunctionMap(config, () => (className, style) => {
		// theme is the first argument if it is an object, otherwise the second argument as an object
		style = typeof className === 'object' && className || Object(style)

		// class name is the first argument if it is a string, otherwise an empty string
		className = typeof className === 'string' ? className : ''

		/** @type {string} Theme name. @see `{CONFIG_PREFIX}t-{THEME_UUID}` */
		className = className || `${toTailDashed(config.prefix)}t-${toHash(style)}`

		const selector = `.${className}`

		const themeObject = {}
		const cssProps = []

		/**
		 * Allows you to set a deep nested property on an object
		 * using a string path.
		 *
		 * @param {string} propPath
		 * @param {*} value
		 * @param {object} obj
		 * @returns {object}
		 */
		const setProp = (propPath = '', value, obj = {}) => {
			const keys = propPath.split('.')
			const lastKey = keys.pop()
			let currentObj = obj || {}

			for (let key of keys) {
				if (!Object.hasOwn(currentObj, key))
					currentObj[key] = {}

				currentObj = currentObj[key]
			}

			currentObj[lastKey] = value
			return obj
		}

		const pushProp = (path, value) => {
			const propScale = path[0]
			const propToken = path.slice(1).join('-')
			const propertyName = `--${toTailDashed(config.prefix)}${path.join('-')}`
			const propertyValue = toTokenizedValue(String(value), config.prefix, path[0])
			const themeToken = new ThemeToken(
				propToken,
				propertyValue,
				propScale,
				config.prefix
			)

			setProp(path.join('.'), themeToken, themeObject)
			cssProps.push(`${propertyName}:${propertyValue}`)
		}


		const getPropPath = (obj, path = []) => {
			for (const key in obj) {
				if (isObject(obj[key]))
					getPropPath(obj[key], [ ...path, key ])
				else
					pushProp([ ...path, key ], obj[key])
			}
		}

		getPropPath(style)

		/*
		for (const scale in style) {
			themeObject[scale] = {}

			//Object.entries(style[scale]) .forEach(([ token, value ]) =>)

			//console.log({ scale })
			for (const token in style[scale]) {
				//console.log({ token })
				const propertyName = `--${toTailDashed(config.prefix)}${scale}-${token}`
				const propertyValue = toTokenizedValue(String(style[scale][token]), config.prefix, scale)

				themeObject[scale][token] = new ThemeToken(token, propertyValue, scale, config.prefix)
				console.log({ themeObject })

				cssProps.push(`${propertyName}:${propertyValue}`)
			}
		}
		*/

		const render = () => {
			if (cssProps.length && !sheet.rules.themed.cache.has(className)) {
				sheet.rules.themed.cache.add(className)

				const rootPrelude = style === config.theme ? ':root,' : ''
				const cssText = `${rootPrelude}.${className}{${cssProps.join(';')}}`

				sheet.rules.themed.apply(cssText)
			}

			return className
		}

		return {
			...themeObject,
			get className() {
				return render()
			},
			selector,
			toString: render,
		}
	})
)
