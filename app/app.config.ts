export default defineAppConfig({
  ui: {
    colors: {
      primary: 'green',
      neutral: 'slate',
    },
    button: {
      slots: {
        base: 'font-semibold rounded-full',
      },
    },
    card: {
      slots: {
        root: 'rounded-2xl ring-1 ring-neutral-200 dark:ring-neutral-800',
      },
    },
  },
})
