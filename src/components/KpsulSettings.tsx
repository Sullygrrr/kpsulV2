import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, Modal, Button } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Settings, Calendar, Shuffle, Check } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native'; // Importation de useNavigation

interface KpsulSettingsProps {
  onReleaseDateChange: (date: Date | null, randomRule?: string) => void;
}

function KpsulSettings({ onReleaseDateChange }: KpsulSettingsProps) {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<'specific' | 'random' | 'yearly'>('yearly');
  const [specificDate, setSpecificDate] = useState('');
  const [randomRule, setRandomRule] = useState('year');
  const [currentDate, setCurrentDate] = useState<Date | null>(null);
  const [currentRule, setCurrentRule] = useState<string | undefined>();

  const navigation = useNavigation(); // Initialisation de useNavigation

  const setDateTo12PM = (date: Date): Date => {
    const newDate = new Date(date);
    newDate.setHours(12, 0, 0, 0);
    return newDate;
  };

  const handleTypeChange = (type: 'specific' | 'random' | 'yearly') => {
    setSelectedType(type);
    if (type === 'yearly') {
      const now = new Date();
      const yearlyDate = new Date(now);
      yearlyDate.setFullYear(2004);  // Fixé à l'année 2004 pour l'option "yearly"
      setCurrentDate(setDateTo12PM(yearlyDate));
      setCurrentRule(undefined);
    }
  };

  const handleSpecificDateChange = (dateStr: string) => {
    setSpecificDate(dateStr);
    const selectedDate = new Date(dateStr);
    if (!isNaN(selectedDate.getTime())) {
      const now = new Date();
      if (selectedDate > now) {
        setCurrentDate(setDateTo12PM(selectedDate));
        setCurrentRule(undefined);
      }
    }
  };

  const handleRandomRuleChange = (rule: string) => {
    setRandomRule(rule);
    const now = new Date();
    let randomDate = new Date();

    switch (rule) {
      case 'year':
        do {
          randomDate = new Date(now.getFullYear(),
            Math.floor(Math.random() * 12),
            Math.floor(Math.random() * 28) + 1
          );
        } while (randomDate <= now);
        break;

      case 'next-year':
        randomDate.setFullYear(now.getFullYear() + 1);
        randomDate.setMonth(Math.floor(Math.random() * 12));
        randomDate.setDate(Math.floor(Math.random() * 28) + 1);
        break;

      case 'five-years':
        const maxYear = now.getFullYear() + 5;
        do {
          randomDate = new Date(
            now.getFullYear() + Math.floor(Math.random() * 5) + 1,
            Math.floor(Math.random() * 12),
            Math.floor(Math.random() * 28) + 1
          );
        } while (randomDate <= now || randomDate.getFullYear() > maxYear);
        break;
    }

    setCurrentDate(setDateTo12PM(randomDate));
    setCurrentRule(rule);
  };

  const handleValidate = () => {
    if (currentDate) {
      onReleaseDateChange(currentDate, currentRule);
      setIsOpen(false);
      navigation.goBack(); // Retour à l'écran précédent après validation
    }
  };

  const isValidSelection = (): boolean => {
    if (!currentDate) return false;
    const now = new Date();
    switch (selectedType) {
      case 'specific':
        return currentDate > now;
      case 'random':
        if (!currentRule) return false;
        switch (currentRule) {
          case 'year':
            return currentDate > now && currentDate.getFullYear() === now.getFullYear();
          case 'next-year':
            return currentDate.getFullYear() === now.getFullYear() + 1;
          case 'five-years':
            return currentDate > now && currentDate.getFullYear() <= now.getFullYear() + 5;
        }
        return false;
      case 'yearly':
        return currentDate !== null;
    }
    return false;
  };

  const getDatePreview = (): string => {
    if (!currentDate) return '';
    if (selectedType === 'yearly') {
      return new Intl.DateTimeFormat(i18n.language, {
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric'
      }).format(currentDate);
    }
    return new Intl.DateTimeFormat(i18n.language, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    }).format(currentDate);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => setIsOpen(!isOpen)} style={styles.settingsButton}>
        <Settings size={24} color="white" />
      </TouchableOpacity>

      {isOpen && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={isOpen}
          onRequestClose={() => setIsOpen(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.label}>{t('kpsul.releaseType')}</Text>
              <View>
                <TouchableOpacity onPress={() => handleTypeChange('yearly')} style={styles.optionButton}>
                  <Calendar size={20} color="white" />
                  <Text>{t('kpsul.yearly')}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleTypeChange('specific')} style={styles.optionButton}>
                  <Calendar size={20} color="white" />
                  <Text>{t('kpsul.specificDate')}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleTypeChange('random')} style={styles.optionButton}>
                  <Shuffle size={20} color="white" />
                  <Text>{t('kpsul.randomDate')}</Text>
                </TouchableOpacity>
              </View>

              {selectedType === 'specific' && (
                <TextInput
                  style={styles.input}
                  placeholder={t('kpsul.chooseDate')}
                  value={specificDate}
                  onChangeText={handleSpecificDateChange}
                  keyboardType="numeric"
                />
              )}

              {selectedType === 'random' && (
                <View>
                  <Text>{t('kpsul.randomRule')}</Text>
                  <TouchableOpacity onPress={() => handleRandomRuleChange('year')}>
                    <Text>{t('kpsul.thisYear')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleRandomRuleChange('next-year')}>
                    <Text>{t('kpsul.nextYear')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleRandomRuleChange('five-years')}>
                    <Text>{t('kpsul.fiveYears')}</Text>
                  </TouchableOpacity>
                </View>
              )}

              <TouchableOpacity onPress={handleValidate} disabled={!isValidSelection()} style={styles.validateButton}>
                <Check size={20} color="white" />
                <Text>{t('kpsul.confirm')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  settingsButton: {
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    padding: 20,
    backgroundColor: 'black',
    borderRadius: 10,
  },
  label: {
    color: 'white',
    fontSize: 18,
    marginBottom: 10,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 10,
    borderRadius: 5,
  },
  input: {
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: 'white',
    marginBottom: 10,
    borderRadius: 5,
  },
  validateButton: {
    padding: 10,
    backgroundColor: 'blue',
    borderRadius: 5,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default KpsulSettings;
