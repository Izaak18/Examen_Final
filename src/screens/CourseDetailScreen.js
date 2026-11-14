import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getCourseById } from '../services/api';

const COLORS = {
  background: '#F4F7FB',
  ink: '#17243A',
  muted: '#718096',
  primary: '#3858D6',
  line: '#E4EAF2',
  white: '#FFFFFF',
  paleBlue: '#EAF0FF',
  red: '#B42318',
};

export default function CourseDetailScreen({ navigation, route }) {
  const { courseId } = route.params;
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');

    getCourseById(courseId, controller.signal)
      .then(setCourse)
      .catch((requestError) => {
        if (!controller.signal.aborted) {
          setError(requestError.message || 'No se pudo cargar el detalle del curso.');
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [courseId, reload]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Volver al catálogo"
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backArrow}>‹</Text>
          <Text style={styles.backLabel}>Catálogo</Text>
        </Pressable>

        {loading ? (
          <View style={styles.stateCard}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.stateText}>Consultando el curso…</Text>
          </View>
        ) : error ? (
          <View style={styles.stateCard}>
            <Text style={styles.errorTitle}>No pudimos cargar el curso</Text>
            <Text style={styles.stateText}>{error}</Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => setReload((value) => value + 1)}
              style={styles.retryButton}
            >
              <Text style={styles.retryButtonText}>Reintentar</Text>
            </Pressable>
          </View>
        ) : course ? (
          <>
            <View style={styles.hero}>
              <View style={styles.heroIcon}>
                <Text style={styles.heroIconText}>A</Text>
              </View>
              <Text style={styles.eyebrow}>DETALLE DEL CURSO</Text>
              <Text style={styles.title}>{course.nombre}</Text>
              <Text style={styles.category}>
                {course.categoria?.nombre || 'Categoría académica'}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <InfoTile label="DURACIÓN" value={`${course.duracion_horas} horas`} />
              <InfoTile label="NIVEL" value={course.nivel} />
            </View>

            <View style={styles.descriptionCard}>
              <Text style={styles.sectionTitle}>Acerca del curso</Text>
              <Text style={styles.description}>{course.descripcion}</Text>
            </View>
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoTile({ label, value }) {
  return (
    <View style={styles.infoTile}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value || 'No especificado'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    paddingHorizontal: 22,
    paddingBottom: 40,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 12,
    paddingRight: 14,
  },
  backArrow: {
    color: COLORS.primary,
    fontSize: 30,
    lineHeight: 32,
    marginRight: 5,
  },
  backLabel: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  hero: {
    alignItems: 'flex-start',
    backgroundColor: COLORS.white,
    borderColor: COLORS.line,
    borderWidth: 1,
    borderRadius: 20,
    padding: 22,
    marginTop: 14,
  },
  heroIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: COLORS.paleBlue,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
  },
  heroIconText: {
    color: COLORS.primary,
    fontSize: 23,
    fontWeight: '800',
  },
  eyebrow: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.4,
    marginBottom: 8,
  },
  title: {
    color: COLORS.ink,
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 34,
    letterSpacing: -0.5,
  },
  category: {
    color: COLORS.muted,
    fontSize: 14,
    marginTop: 10,
  },
  infoRow: {
    flexDirection: 'row',
    marginTop: 14,
  },
  infoTile: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderColor: COLORS.line,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginRight: 8,
  },
  infoLabel: {
    color: COLORS.muted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  infoValue: {
    color: COLORS.ink,
    fontSize: 14,
    fontWeight: '700',
    marginTop: 8,
  },
  descriptionCard: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.line,
    borderWidth: 1,
    borderRadius: 18,
    padding: 20,
    marginTop: 14,
  },
  sectionTitle: {
    color: COLORS.ink,
    fontSize: 17,
    fontWeight: '700',
  },
  description: {
    color: COLORS.muted,
    fontSize: 14,
    lineHeight: 22,
    marginTop: 10,
  },
  stateCard: {
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderColor: COLORS.line,
    borderWidth: 1,
    borderRadius: 18,
    padding: 24,
    marginTop: 14,
  },
  stateText: {
    color: COLORS.muted,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 12,
    textAlign: 'center',
  },
  errorTitle: {
    color: COLORS.red,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 11,
    marginTop: 16,
  },
  retryButtonText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '700',
  },
});
