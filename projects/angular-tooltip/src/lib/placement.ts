/**
 * Describes the direction in which the tooltip is placed with respect to its anchor.
 */
export type Placement =
  /**
   * The tooltip will be placed either at the left or at the right with respect to its anchor
   * depending on how much available space there is in that direction. By default,
   * the tooltip will be placed at the right of its anchor for this placement.
   */
  | 'horizontal'

  /**
   * The tooltip will be placed either at the bottom or at the top with respect to its anchor
   * depending on how much available space there is in that direction. By default,
   * the tooltip will be placed at the bottom of its anchor for this placement.
   * This is the default placement if not specified
   */
  | 'vertical';
