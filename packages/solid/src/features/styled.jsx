import { Dynamic } from 'solid-js/web'
import { Fragment } from 'solid-js/h/jsx-runtime'

import { internal } from '../../../core/src/utility/internal.js'
import { createMemo } from '../../../core/src/utility/createMemo.js'

import { createCssFunction } from '../../../core/src/features/css.js'

const createCssFunctionMap = createMemo()

/** Returns a function that applies component styles. */
export const createStyledFunction = ({ config, sheet }) =>
	createCssFunctionMap(config, () => {
		const cssFunction = createCssFunction(config, sheet)

		const _styled = (
			args,
			css = cssFunction,
			{ displayName, shouldForwardStitchesProp } = {}
		) => {

			const cssComponent = css(...args)
			const DefaultType = cssComponent[internal].type
			const shouldForwardAs = shouldForwardStitchesProp?.('as')

			const styledComponent = (props) => {
				const tag = props?.as && !shouldForwardAs
					? props?.as : DefaultType

				const {
					props: forwardProps,
					deferredInjector
				} = cssComponent(props)

				const component = Dynamic({
					component: tag,
					...forwardProps
				})

				if (!shouldForwardAs)
					delete forwardProps.as

				if (deferredInjector) return Fragment({
					children: [
						component,
						Dynamic({ component: deferredInjector })
					]
				})

				return component
			}

			const toString = () => cssComponent.selector

			styledComponent.className = cssComponent.className
			styledComponent.selector = cssComponent.selector
			styledComponent.toString = toString
			styledComponent[internal] = cssComponent[internal]
			styledComponent.displayName = displayName ||
				`Styled.${DefaultType.displayName
					|| DefaultType.name
					|| DefaultType}`

			return styledComponent
		}

		const styled = (...args) => _styled(args)

		styled.withConfig = (componentConfig) => (...args) => {
			const cssWithConfig = cssFunction
				.withConfig(componentConfig)

			return _styled(args, cssWithConfig, componentConfig)
		}

		return styled
	})
