export default {
  flatKey: 'There {count, plural, =0 {are no answers} =1 {is one answer} other {are # answers}}!',
  nestedKey: {
    nestedKey: ['multiline value 1 {foo, date}', 'multiline value 2 {bar}'],
  },
} as const;
