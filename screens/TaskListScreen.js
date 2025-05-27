import React, { useState, useContext, useRef, useEffect, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  Switch, 
  Image, 
  KeyboardAvoidingView, 
  Platform, 
  Dimensions 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ThemeContext } from '../context/ThemeContext';

const { width, height } = Dimensions.get('window');

const TaskListScreen = () => {
  // useContext: para obter o tema atual e alternar entre claro/escuro
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  const navigation = useNavigation();

  // useState: para controlar lista de tarefas, input de texto e data da nova tarefa
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [newTaskDate, setNewTaskDate] = useState('');

  // useRef: para referenciar o input e focar automaticamente no campo ao abrir a tela
  const taskInputRef = useRef(null);
  const dateInputRef = useRef(null);

  // useEffect: para executar ações ao montar o componente, como focar no input e carregar tarefas iniciais
  useEffect(() => {
    taskInputRef.current?.focus();
    setTasks([
      { id: 1, title: 'Fazer compras', completed: false, date: '15/06/2023' },
      { id: 2, title: 'Estudar React Native', completed: true, date: '10/06/2023' },
      { id: 3, title: 'Ir à academia', completed: false, date: '12/06/2023' },
    ]);
  }, []);

  const formatDateInput = (text) => {
    let cleanedText = text.replace(/[^\d]/g, '');
    if (cleanedText.length > 2 && cleanedText.length <= 4) {
      cleanedText = cleanedText.replace(/(\d{2})(\d{0,2})/, '$1/$2');
    } else if (cleanedText.length > 4) {
      cleanedText = cleanedText.replace(/(\d{2})(\d{2})(\d{0,4})/, '$1/$2/$3');
    }
    return cleanedText.substring(0, 10);
  };

  const handleDateChange = (text) => {
    const formattedDate = formatDateInput(text);
    setNewTaskDate(formattedDate);
  };

  const addTask = () => {
    if (newTask.trim() === '') return;
    const newTaskObj = {
      id: Date.now(),
      title: newTask,
      completed: false,
      date: newTaskDate || 'Sem data',
    };
    setTasks([...tasks, newTaskObj]);
    setNewTask('');
    setNewTaskDate('');
    taskInputRef.current?.focus();
  };

  const toggleTask = (taskId) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  const navigateToEdit = (task) => {
    navigation.navigate('TaskEdit', { 
      task, 
      onSave: (updatedTask) => {
        setTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t));
      },
      onDelete: (taskId) => {
        setTasks(tasks.filter(t => t.id !== taskId));
      }
    });
  };

  // useMemo: para calcular total de tarefas e pendentes, otimizando re-renderizações
  const { totalTasks, pendingTasks } = useMemo(() => {
    const total = tasks.length;
    const pending = tasks.filter(task => !task.completed).length;
    return { totalTasks: total, pendingTasks: pending };
  }, [tasks]);

  const styles = getStyles(isDarkMode);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
    >
      <Image 
        source={isDarkMode ? require('../assets/fundoescuro.png') : require('../assets/fundoclaro.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      />

      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Lista de Tarefas</Text>
          <TouchableOpacity onPress={toggleTheme} style={styles.themeButton}>
            <Text style={styles.themeIcon}>{isDarkMode ? '☼' : '☾'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.contentWrapper}>
        <View style={styles.tasksWrapper}>
          <ScrollView 
            style={styles.tasksContainer}
            contentContainerStyle={styles.taskScrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {tasks.map((task, index) => (
              <React.Fragment key={task.id}>
                <View style={[styles.taskItem, task.completed && styles.completedTask]}>
                  <View style={styles.taskContent}>
                    <View style={styles.taskHeader}>
                      <TouchableOpacity onPress={() => navigateToEdit(task)}>
                        <Image 
                          source={{ uri: 'https://cdn-icons-png.flaticon.com/512/1159/1159633.png' }} 
                          style={styles.editIcon}
                        />
                      </TouchableOpacity>
                      <Text style={[styles.taskTitle, task.completed && styles.completedText]}>{task.title}</Text>
                      <Switch
                        value={task.completed}
                        onValueChange={() => toggleTask(task.id)}
                        thumbColor={isDarkMode ? '#8c618b' : '#663364'}
                        trackColor={{ false: '#d9bdd8', true: '#b38fb2' }}
                      />
                    </View>

                    <View style={styles.taskDate}>
                      <Image 
                        source={{ uri: 'https://cdn-icons-png.flaticon.com/512/747/747310.png' }} 
                        style={styles.calendarIcon}
                      />
                      <Text style={styles.dateText}>{task.date}</Text>
                    </View>
                  </View>
                </View>
                {index < tasks.length - 1 && <View style={styles.taskDivider} />}
              </React.Fragment>
            ))}
          </ScrollView>
        </View>

        <View style={styles.stats}>
          <Text style={styles.statsText}>Total: {totalTasks} | Pendentes: {pendingTasks}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              ref={taskInputRef}
              style={styles.input}
              placeholder="Nova tarefa"
              placeholderTextColor={isDarkMode ? '#fff3ff' : '#8c618b'}
              value={newTask}
              onChangeText={setNewTask}
            />
          </View>

          <View style={styles.inputWrapper}>
            <TextInput
              ref={dateInputRef}
              style={styles.input}
              placeholder="Data (dd/mm/aaaa)"
              placeholderTextColor={isDarkMode ? '#fff3ff' : '#8c618b'}
              value={newTaskDate}
              onChangeText={handleDateChange}
              keyboardType="numeric"
            />
          </View>

          <TouchableOpacity style={styles.addButton} onPress={addTask}>
            <Text style={styles.addButtonText}>Adicionar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const getStyles = (isDarkMode) => StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  header: {
    paddingTop: 80,
    paddingBottom: 15,
  },
  contentWrapper: {
    flex: 1,
    marginBottom: 80,
    padding: 20,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 40,
    borderTopWidth: 1,
    borderTopColor: isDarkMode ? '#8c618b' : '#d9bdd8',
  },
  tasksWrapper: {
    flex: 1,
    maxHeight: '60%',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    backgroundColor: isDarkMode ? '#663364' : '#8c618b',
    borderRadius: 20,
    marginRight: 15,
    padding: 5,
  },
  themeButton: {
    backgroundColor: isDarkMode ? '#663364' : '#8c618b',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  themeIcon: {
    fontSize: 24,
    color: '#ffffff',
  },
  tasksContainer: {
    backgroundColor: isDarkMode ? 'rgba(102, 51, 100, 0.8)' : 'rgba(255, 235, 255, 0.8)',
    borderRadius: 10,
    marginHorizontal: 20,
    marginTop: 10,
    maxHeight: height * 0.4,
  },
  taskScrollContent: {
    paddingVertical: 5,
  },
  taskItem: {
    padding: 15,
  },
  taskDivider: {
    height: 1,
    backgroundColor: isDarkMode ? 'rgba(179, 143, 178, 0.5)' : 'rgba(140, 97, 139, 0.5)',
    marginHorizontal: 15,
  },
  taskContent: {
    flex: 1,
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  editIcon: {
    width: 20,
    height: 20,
    tintColor: isDarkMode ? '#d9bdd8' : '#8c618b',
    marginRight: 10,
  },
  taskTitle: {
    flex: 1,
    fontSize: 18,
    color: isDarkMode ? '#ffebff' : '#663364',
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: isDarkMode ? '#b38fb2' : '#8c618b',
  },
  taskDate: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 30,
  },
  calendarIcon: {
    width: 16,
    height: 16,
    tintColor: isDarkMode ? '#d9bdd8' : '#8c618b',
    marginRight: 5,
  },
  dateText: {
    fontSize: 14,
    color: isDarkMode ? '#d9bdd8' : '#8c618b',
  },
  stats: {
    alignItems: 'center',
    marginTop: 10,
  },
  statsText: {
    fontSize: 16,
    color: isDarkMode ? '#ffebff' : '#663364',
  },
  inputContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: isDarkMode ? '#8c618b' : '#d9bdd8',
  },
  inputWrapper: {
    marginBottom: 10,
    backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(102, 51, 100, 0.1)',
    borderRadius: 5,
  },
  input: {
    height: 40,
    paddingHorizontal: 10,
    color: isDarkMode ? '#ffebff' : '#663364',
  },
  addButton: {
    backgroundColor: isDarkMode ? '#8c618b' : '#663364',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#ffebff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default TaskListScreen;
