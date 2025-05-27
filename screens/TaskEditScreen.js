import React, { useState, useContext, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
  Image,
  TextInput,
  Modal,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { ThemeContext } from '../context/ThemeContext';

const TaskEditScreen = () => {
  // useContext para reutilizar o tema escuro/claro
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);

  const navigation = useNavigation();
  const route = useRoute();
  const { task, onSave, onDelete } = route.params;

  // useState para armazenar os dados atuais da tarefa a ser editada
  const [editedTask, setEditedTask] = useState(task);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [editTitleModalVisible, setEditTitleModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState(task.title);

  // useCallback para evitar recriação da função toda vez que o componente renderizar
  // Função para salvar as alterações da tarefa editada
  const handleSave = useCallback(() => {
    onSave(editedTask);
    navigation.goBack();
  }, [editedTask, onSave, navigation]);

  const showDatePicker = () => setDatePickerVisibility(true);
  const hideDatePicker = () => setDatePickerVisibility(false);

  // useCallback para evitar recriação da função toda vez que o componente renderizar
  // Função para confirmar a nova data selecionada
  const handleDateConfirm = useCallback((date) => {
    const formattedDate = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    setEditedTask(prev => ({ ...prev, date: formattedDate }));
    hideDatePicker();
  }, []);

  // useCallback para evitar recriação da função toda vez que o componente renderizar
  // Função para abrir o modal de edição do título
  const handleEditTitle = useCallback(() => {
    setNewTitle(editedTask.title);
    setEditTitleModalVisible(true);
  }, [editedTask.title]);

  const confirmEditTitle = () => {
    if (newTitle.trim() !== '') {
      setEditedTask(prev => ({ ...prev, title: newTitle.trim() }));
    }
    setEditTitleModalVisible(false);
  };

  const handleEditDate = () => showDatePicker();

  // useCallback para evitar recriação da função toda vez que o componente renderizar
  // Função para excluir a tarefa com confirmação do usuário
  const handleDelete = useCallback(() => {
    Alert.alert(
      'Excluir tarefa',
      'Tem certeza que deseja excluir esta tarefa?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          onPress: () => {
            onDelete(editedTask.id);
            navigation.goBack();
          },
        },
      ]
    );
  }, [editedTask.id, navigation, onDelete]);

  const toggleCompleted = () => {
    setEditedTask(prev => ({ ...prev, completed: !prev.completed }));
  };

  const styles = getStyles(isDarkMode);

  return (
    <View style={styles.container}>
      <Image
        source={isDarkMode ? require('../assets/fundoescuro.png') : require('../assets/fundoclaro.png')}
        style={styles.backgroundImage}
      />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.themeButton}>
          <Text style={styles.backIcon}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Editor de Tarefas</Text>
        <TouchableOpacity onPress={toggleTheme} style={styles.themeButton}>
          <Text style={styles.themeIcon}>{isDarkMode ? '☼' : '☾'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.taskContainer}>
        <Text style={styles.taskTitle}>{editedTask.title}</Text>

        <View style={styles.taskProperty}>
          <Text style={styles.propertyLabel}>Status:</Text>
          <Switch
            value={editedTask.completed}
            onValueChange={toggleCompleted}
            thumbColor={isDarkMode ? '#8c618b' : '#663364'}
            trackColor={{ false: '#d9bdd8', true: '#b38fb2' }}
          />
          <Text style={styles.propertyValue}>
            {editedTask.completed ? 'Concluído' : 'Pendente'}
          </Text>
        </View>

        <View style={styles.taskProperty}>
          <Text style={styles.propertyLabel}>Data:</Text>
          <TouchableOpacity onPress={handleEditDate} style={styles.dateButton}>
            <Image
              source={{ uri: 'https://cdn-icons-png.flaticon.com/512/747/747310.png' }}
              style={styles.calendarIcon}
            />
            <Text style={styles.propertyValue}>{editedTask.date}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleEditTitle}>
          <Text style={styles.buttonText}>Editar Título</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleEditDate}>
          <Text style={styles.buttonText}>Editar Data</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleDelete}>
          <Text style={styles.buttonText}>Excluir Tarefa</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.buttonText}>Salvar Alterações</Text>
        </TouchableOpacity>
      </View>

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleDateConfirm}
        onCancel={hideDatePicker}
      />

      <Modal
        visible={editTitleModalVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setEditTitleModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Novo nome da tarefa:</Text>
            <TextInput
              value={newTitle}
              onChangeText={setNewTitle}
              style={styles.modalInput}
              placeholder="Digite o novo título"
              placeholderTextColor="#aaa"
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={() => setEditTitleModalVisible(false)} style={styles.modalButton}>
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={confirmEditTitle} style={styles.modalButton}>
                <Text style={styles.buttonText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
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
    resizeMode: 'cover',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 60,
  },
  backIcon: {
    fontSize: 24,
    color: '#ffffff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    backgroundColor: isDarkMode ? '#663364' : '#8c618b',
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 10,
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
  taskContainer: {
    backgroundColor: isDarkMode ? 'rgba(102, 51, 100, 0.8)' : 'rgba(255, 235, 255, 0.9)',
    borderRadius: 10,
    padding: 20,
    marginHorizontal: 30,
    marginTop: 20,
  },
  taskTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: isDarkMode ? '#ffebff' : '#663364',
    marginBottom: 20,
    textAlign: 'center',
  },
  taskProperty: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    flexWrap: 'wrap',
  },
  propertyLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: isDarkMode ? '#d9bdd8' : '#8c618b',
    width: 80,
  },
  propertyValue: {
    fontSize: 16,
    color: isDarkMode ? '#ffebff' : '#663364',
  },
  calendarIcon: {
    width: 20,
    height: 20,
    tintColor: isDarkMode ? '#d9bdd8' : '#8c618b',
    marginRight: 8,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonContainer: {
    marginHorizontal: 40,
    marginTop: 20,
  },
  button: {
    backgroundColor: isDarkMode ? '#8c618b' : '#663364',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 10,
  },
  saveButton: {
    backgroundColor: isDarkMode ? '#b38fb2' : '#8c618b',
    padding: 15,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#ffebff',
    fontWeight: 'bold',
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: isDarkMode ? '#4a2f4a' : '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: isDarkMode ? '#ffebff' : '#663364',
    marginBottom: 10,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    backgroundColor: isDarkMode ? '#fff3ff' : '#fff',
    color: '#000',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    backgroundColor: isDarkMode ? '#8c618b' : '#663364',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 5,
  },
});

export default TaskEditScreen;
