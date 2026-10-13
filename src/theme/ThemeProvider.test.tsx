import { fireEvent, render, screen } from '@testing-library/react-native';
import { Text, Pressable } from 'react-native';
import { ThemeProvider, useTheme } from './ThemeProvider';

function ThemeProbe() {
  const { mode, colors, setMode } = useTheme();
  return <>
    <Text>{mode}</Text>
    <Text>{colors.canvas}</Text>
    <Pressable accessibilityRole="button" onPress={() => setMode('dark')}><Text>Dark</Text></Pressable>
  </>;
}

describe('ThemeProvider', () => {
  it('switches palettes and persists the selected mode', () => {
    const persist = jest.fn(async () => {});
    render(<ThemeProvider onModeChange={persist}><ThemeProbe /></ThemeProvider>);
    expect(screen.getByText('#F6F5EF')).toBeTruthy();
    fireEvent.press(screen.getByRole('button', { name: 'Dark' }));
    expect(screen.getByText('dark')).toBeTruthy();
    expect(screen.getByText('#10130F')).toBeTruthy();
    expect(persist).toHaveBeenCalledWith('dark');
  });
});
