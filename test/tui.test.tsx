/** @jsxImportSource @opentui/solid */
import { describe, expect, test } from "bun:test"
import { testRender } from "@opentui/solid"
import { RGBA } from "@opentui/core"
import type { Context } from "@opencode/plugin/tui/context"
import plugin, {
  COMMANDS,
  DEFAULT_LABELS,
  NavButtons,
  resolveLabels,
  type Labels,
} from "../src/tui.tsx"

const BASE = RGBA.fromHex("#101010")
const HOVER = RGBA.fromHex("#202020")

async function flushEffects() {
  for (let index = 0; index < 20; index += 1) await Promise.resolve()
}

function firstRow(setup: { captureCharFrame: () => string }): string {
  return setup.captureCharFrame().split("\n")[0] ?? ""
}

function spanFor(
  setup: { captureSpans: () => { lines: Array<{ spans: Array<{ text: string; fg: RGBA }> }> } },
  text: string,
) {
  for (const line of setup.captureSpans().lines) {
    for (const span of line.spans) {
      if (span.text.includes(text)) return span
    }
  }
  throw new Error(`No span containing ${JSON.stringify(text)}`)
}

async function mountNav(labels: Labels = DEFAULT_LABELS) {
  const calls: string[] = []
  let renderer: { requestRender: () => void } | undefined
  const setup = await testRender(
    () => (
      <NavButtons
        labels={labels}
        colors={{ base: BASE, hovered: HOVER }}
        dispatch={(command) => calls.push(command)}
        requestRender={() => renderer?.requestRender()}
      />
    ),
    { width: 32, height: 2 },
  )
  renderer = setup.renderer
  await setup.renderOnce()
  return { setup, calls }
}

describe("resolveLabels", () => {
  test("uses the default labels when the option is absent", () => {
    expect(resolveLabels({})).toEqual(DEFAULT_LABELS)
  })

  test("accepts both labels from options.labels", () => {
    expect(resolveLabels({ labels: { prev: "Back ↑", next: "Forward ↓" } })).toEqual({
      prev: "Back ↑",
      next: "Forward ↓",
    })
  })

  test("falls back per side for empty, non-string and malformed values", () => {
    expect(resolveLabels({ labels: { prev: "", next: 42 } })).toEqual(DEFAULT_LABELS)
    expect(resolveLabels({ labels: { prev: "  ", next: " Next " } })).toEqual({
      prev: DEFAULT_LABELS.prev,
      next: " Next ",
    })
    expect(resolveLabels({ labels: null })).toEqual(DEFAULT_LABELS)
    expect(resolveLabels({ labels: [] })).toEqual(DEFAULT_LABELS)
    expect(resolveLabels({ labels: "Prev" })).toEqual(DEFAULT_LABELS)
  })
})

describe("NavButtons", () => {
  test("renders both labels on one right-aligned row", async () => {
    const { setup } = await mountNav()
    const rows = setup.captureCharFrame().split("\n")
    const row = rows[0] ?? ""

    expect(row).toContain("Prev ↑")
    expect(row).toContain("Next ↓")
    expect(row.trimEnd().endsWith("Prev ↑ Next ↓")).toBe(true)
    expect(row.indexOf("Prev ↑")).toBeGreaterThan(0)
    expect(rows.filter((line) => line.includes("Prev ↑") || line.includes("Next ↓"))).toHaveLength(1)

    await setup.dispose()
  })

  test("renders labels from options", async () => {
    const { setup } = await mountNav({ prev: "Back ↑", next: "Forward ↓" })
    const row = firstRow(setup)

    expect(row).toContain("Back ↑")
    expect(row).toContain("Forward ↓")

    await setup.dispose()
  })

  test("dispatches the previous user message command on click", async () => {
    const { setup, calls } = await mountNav()
    const column = firstRow(setup).indexOf("Prev ↑")

    await setup.mockMouse.click(column, 0)
    await setup.renderOnce()

    expect(calls).toEqual([COMMANDS.prev])
    await setup.dispose()
  })

  test("dispatches the next user message command on click", async () => {
    const { setup, calls } = await mountNav()
    const column = firstRow(setup).indexOf("Next ↓")

    await setup.mockMouse.click(column, 0)
    await setup.renderOnce()

    expect(calls).toEqual([COMMANDS.next])
    await setup.dispose()
  })

  test("switches the label colour on hover and back on leave", async () => {
    const { setup, calls } = await mountNav()
    const column = firstRow(setup).indexOf("Prev ↑")

    expect(spanFor(setup, "Prev ↑").fg.equals(BASE)).toBe(true)

    await setup.mockMouse.moveTo(column, 0)
    await flushEffects()
    await setup.renderOnce()
    expect(spanFor(setup, "Prev ↑").fg.equals(HOVER)).toBe(true)
    expect(calls).toEqual([])

    await setup.mockMouse.moveTo(0, 1)
    await flushEffects()
    await setup.renderOnce()
    expect(spanFor(setup, "Prev ↑").fg.equals(BASE)).toBe(true)

    await setup.dispose()
  })
})

describe("plugin", () => {
  test("uses the package name as its id and pins the default labels and commands", () => {
    expect(plugin.id).toBe("opencode-message-nav")
    expect(DEFAULT_LABELS).toEqual({ prev: "Prev ↑", next: "Next ↓" })
    expect(COMMANDS).toEqual({
      prev: "session.message.user.previous",
      next: "session.message.user.next",
    })
  })

  test("registers the row in session.composer.top and reads labels from options", async () => {
    const calls: string[] = []
    const unregister = () => {}
    let claim: {
      append?: string
      render: (input: { sessionID: string }) => unknown
    } | undefined

    const context = {
      options: { labels: { prev: "Back ↑", next: "Forward ↓" } },
      theme: { text: { action: { secondary: { base: BASE, hovered: HOVER } } } },
      renderer: { requestRender: () => {} },
      keymap: { dispatch: (command: string) => calls.push(command) },
      ui: {
        slot: (next: typeof claim) => {
          claim = next
          return unregister
        },
      },
    } as unknown as Context

    const cleanup = plugin.setup(context)
    expect(claim?.append).toBe("session.composer.top")
    expect(cleanup).toBe(unregister)

    const setup = await testRender(() => claim!.render({ sessionID: "ses_test" }) as never, {
      width: 32,
      height: 2,
    })
    await setup.renderOnce()

    const row = firstRow(setup)
    expect(row).toContain("Back ↑")
    expect(row).toContain("Forward ↓")

    await setup.mockMouse.click(row.indexOf("Back ↑"), 0)
    await setup.renderOnce()
    expect(calls).toEqual([COMMANDS.prev])

    await setup.dispose()
  })
})
