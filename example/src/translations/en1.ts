export default {
  flatKey: 'There {count, plural, =0 {are no answers {no}} =1 {is one answer {one}} other {are # answers {other, date}}}!',
  nestedKey: {
    nestedKey: 'value 1 {foo, date}',
  },
  // big: '{count, plural, =0 {0} =0 {0} =0 {0} =0 {0} =0 {0} =0 {0} =0 {0} =0 {0} =0 {0} =0 {0} =0 {0} =0 {0} =0 {0} }',
} as const;
