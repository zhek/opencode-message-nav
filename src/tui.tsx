/** @jsxImportSource @opentui/solid */
import { Plugin } from "@opencode/plugin/tui"
import type { Context } from "@opencode/plugin/tui/context"
import type { RGBA, TextRenderable } from "@opentui/core"
import { createEffect, createSignal } from "solid-js"

/** The labels shown when `options.labels` is absent or invalid. */
export const DEFAULT_LABELS = {
  prev: "Prev ↑",
  next: "Next ↓",
} as const

/** The built-in commands the buttons dispatch. */
export const COMMANDS = {
  prev: "session.message.user.previous",
  next: "session.message.user.next",
} as const

export interface Labels {
  readonly prev: string
  readonly next: string
}

export interface ButtonColors {
  readonly base: string | RGBA
  readonly hovered: string | RGBA
}

export interface NavButtonsProps {
  readonly labels: Labels
  readonly colors: ButtonColors
  readonly dispatch: (command: string) => void
  readonly requestRender?: () => void
}

function label(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0 ? value : undefined
}

/**
 * Reads `options.labels`. A missing or malformed object falls back to the
 * defaults; each side falls back on its own, so one bad value cannot hide the
 * other.
 */
export function resolveLabels(options: Readonly<Record<string, unknown>>): Labels {
  const raw = options.labels
  if (raw === null || typeof raw !== "object" || Array.isArray(raw)) return DEFAULT_LABELS

  const labels = raw as Readonly<Record<string, unknown>>
  return {
    prev: label(labels.prev) ?? DEFAULT_LABELS.prev,
    next: label(labels.next) ?? DEFAULT_LABELS.next,
  }
}

function NavButton(props: {
  readonly label: string
  readonly command: string
  readonly colors: ButtonColors
  readonly dispatch: (command: string) => void
  readonly requestRender?: () => void
}) {
  const [hovered, setHovered] = createSignal(false)
  let text: TextRenderable | undefined

  // Plugin JSX is compiled without reactive prop getters, so the colour is
  // written to the renderable and the host is asked for the next frame.
  createEffect(() => {
    const color = hovered() ? props.colors.hovered : props.colors.base
    if (text) text.fg = color
    props.requestRender?.()
  })

  return (
    <box
      paddingLeft={1}
      onMouseOver={() => setHovered(true)}
      onMouseOut={() => setHovered(false)}
      onMouseUp={() => props.dispatch(props.command)}
    >
      <text
        ref={(node) => {
          text = node
        }}
        fg={props.colors.base}
      >
        {props.label}
      </text>
    </box>
  )
}

/** The two-button row rendered in the `session.composer.top` slot. */
export function NavButtons(props: NavButtonsProps) {
  return (
    <box flexDirection="row" justifyContent="flex-end" height={1} flexShrink={0}>
      <NavButton
        label={props.labels.prev}
        command={COMMANDS.prev}
        colors={props.colors}
        dispatch={props.dispatch}
        requestRender={props.requestRender}
      />
      <NavButton
        label={props.labels.next}
        command={COMMANDS.next}
        colors={props.colors}
        dispatch={props.dispatch}
        requestRender={props.requestRender}
      />
    </box>
  )
}

export default Plugin.define({
  id: "opencode-message-nav",
  setup(context) {
    const labels = resolveLabels(context.options)
    const colors = {
      base: context.theme.text.action.secondary.base,
      hovered: context.theme.text.action.secondary.hovered,
    }

    return context.ui.slot({
      append: "session.composer.top",
      render: () => (
        <NavButtons
          labels={labels}
          colors={colors}
          requestRender={() => context.renderer.requestRender()}
          dispatch={(command) => context.keymap.dispatch(command)}
        />
      ),
    })
  },
})
