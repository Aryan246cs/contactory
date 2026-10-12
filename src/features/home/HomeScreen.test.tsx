import { fireEvent, render } from '@testing-library/react-native';
import { router } from 'expo-router';
import { HomeScreen } from './HomeScreen';

jest.mock('expo-router', () => ({ router: { push: jest.fn() }, useFocusEffect: jest.fn() }));
jest.mock('@/database/repositories/contactsRepository', () => ({ listContacts: jest.fn().mockResolvedValue([]) }));

describe('HomeScreen', () => {
  it('makes Scan Card the primary action and opens the scan route', () => {
    const view = render(<HomeScreen />);
    expect(view.getByText('Scan Card')).toBeTruthy();
    fireEvent.press(view.getByLabelText('Scan Card'));
    expect(router.push).toHaveBeenCalledWith('/scan');
  });

  it('shows the local-first empty network state', () => {
    const view = render(<HomeScreen />);
    expect(view.getByText('A good place to start.')).toBeTruthy();
    expect(view.getByText('ON THIS DEVICE')).toBeTruthy();
  });
});
