import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import TaskListScreen from './screens/TaskListScreen';
import TaskEditScreen from './screens/TaskEditScreen';
import { ThemeProvider } from './context/ThemeContext';

const Stack = createStackNavigator();

export default function App() {
  return (
    <ThemeProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="TaskList" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="TaskList" component={TaskListScreen} />
          <Stack.Screen name="TaskEdit" component={TaskEditScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </ThemeProvider>
  );
}