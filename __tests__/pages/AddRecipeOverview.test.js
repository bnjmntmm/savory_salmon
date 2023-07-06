import React from 'react';
import renderer from 'react-test-renderer'

import AddRecipeOverview from '../../components/pages/AddRecipeOverview'

it('renders correctly', () => {
  const tree = renderer.create(<AddRecipeOverview />).toJSON();
  expect(tree).toMatchSnapshot();
});
