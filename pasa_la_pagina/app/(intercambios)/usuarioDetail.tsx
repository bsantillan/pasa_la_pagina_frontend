// UsuarioDetail.tsx - versión con componentes de botón personalizados
import { AlertCard } from "@/components/ui/AlertaCard";
import { Avatar } from "@/components/ui/Avatar";
import PrimaryButton from "@/components/ui/Boton/Primary";
import SecondaryButton from "@/components/ui/Boton/Secondary";
import { Colors } from "@/constants/Colors";
import { useAuth } from "@/contexts/AuthContext";
import { useChat } from "@/contexts/ChatContext";
import { EstadoIntercambio, useIntercambio } from "@/contexts/IntercambioContext";
import Ionicons from "@expo/vector-icons/build/Ionicons";
import { Client } from "@stomp/stompjs";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import SockJS from "sockjs-client";

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");

  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

export default function UsuarioDetail() {

  const { chatInfo } = useChat();

  const {
    intercambios,
    loading: intercambioLoading,
    //ultimoEstadoIntercambio,
    //wsConnected,
  } = useIntercambio();

  const {
    validarIntercambioConCodigo,
    cancelarIntercambio,
    generarCodigoValidacion,
  } = useIntercambio();
  const { getValidAccessToken, user } = useAuth();

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(false);

  const [codigoInput, setCodigoInput] = useState("");
  const [validationSuccess, setValidationSuccess] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [codigoGenerado, setCodigoGenerado] = useState("");
  const [codigoYaGenerado, setCodigoYaGenerado] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewStep, setReviewStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const [ultimoEstadoIntercambio, setUltimoEstadoIntercambio] = useState<{
    intercambioId: number;
    estado: EstadoIntercambio;
    puedeDejarResena: boolean;
    mensaje: string;
  } | null>(null);

  // 👇 Ref para mantener el cliente STOMP
  const stompClientRef = useRef<Client | null>(null);
  const isConnectedRef = useRef(false);

  // 👇 Resetear estados al abrir el modal
  useEffect(() => {
    if (showReviewModal) {
      setReviewStep(1);
      setRating(0);
      setFeedback("");
    }
  }, [showReviewModal]);

  // 👇 useRef para mantener el intervalo
  const pollingIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (chatInfo?.intercambio_id && !isConnectedRef.current) {
      const connectWebSocket = async () => {
        try {
          const token = await getValidAccessToken();
          if (!token) throw new Error("No hay token válido");

          const client = new Client({
            webSocketFactory: () => new SockJS(`${process.env.EXPO_PUBLIC_API_URL}ws`),
            connectHeaders: {
              Authorization: `Bearer ${token}`,
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
            debug: (str) => console.log("STOMP local:", str),
          });

          client.onConnect = () => {
            console.log("✅ WebSocket local conectado");
            setWsConnected(true);
            isConnectedRef.current = true;

            // Suscribirse a notificaciones de intercambio
            client.subscribe("/user/queue/intercambio-estado", (message) => {
              try {
                const data = JSON.parse(message.body);
                console.log("📡 Notificación de intercambio recibida:", data);
                setUltimoEstadoIntercambio(data);
              } catch (err) {
                console.error("Error al parsear mensaje de intercambio:", err);
              }
            });
          };

          client.onStompError = (frame) => {
            console.error("STOMP Error:", frame.headers?.["message"]);
            console.error("Detalles:", frame.body);
            isConnectedRef.current = false;
            setWsConnected(false);
          };

          client.onWebSocketError = (error) => {
            console.error("WebSocket Error:", error);
            isConnectedRef.current = false;
            setWsConnected(false);
          };

          client.onDisconnect = () => {
            console.log("❌ WebSocket local desconectado");
            isConnectedRef.current = false;
            setWsConnected(false);
          };

          client.activate();
          stompClientRef.current = client;
        } catch (err) {
          console.error("Error al conectar WebSocket:", err);
        }
      };

      connectWebSocket();
    }
  }, [chatInfo?.intercambio_id, getValidAccessToken]);

  // 👇 Limpiar WebSocket cuando se desmonta
  useEffect(() => {
    return () => {
      if (stompClientRef.current?.active) {
        stompClientRef.current.deactivate();
      }
      isConnectedRef.current = false;
    };
  }, []);

  // 👇 Escuchar notificaciones de WebSocket (primera opción)
  useEffect(() => {
    if (ultimoEstadoIntercambio && ultimoEstadoIntercambio.intercambioId) {
      console.log("🔔 Notificación recibida:", ultimoEstadoIntercambio);
      console.log(
        "🆔 Comparando ID:",
        ultimoEstadoIntercambio.intercambioId,
        "con",
        Number(chatInfo?.intercambio_id)
      );

      if (ultimoEstadoIntercambio.intercambioId === Number(chatInfo?.intercambio_id)) {
        console.log("✅ ID coincide, estado:", ultimoEstadoIntercambio.estado);

        if (ultimoEstadoIntercambio.estado === "CONCRETADO") {
          console.log("✅ Estado es CONCRETADO - actualizando UI");
          setValidationSuccess(true);

          setTimeout(() => {
            setValidationSuccess(false);
            setShowCodeModal(false);
            // Redirigir a ambos usuarios a la pantalla de reseña
            setShowReviewModal(true);
          }, 1500);
        }
      }
    }
  }, [ultimoEstadoIntercambio, chatInfo?.intercambio_id]);

  // 👇 Polling como respaldo (si WebSocket falla o no se conecta)
  useEffect(() => {
    if (showCodeModal && isOwner) {
      // Iniciar polling cada 3 segundos como respaldo
      pollingIntervalRef.current = setInterval(async () => {
        try {
          const token = await getValidAccessToken();
          if (!token) throw new Error("No hay token válido");

          const res = await fetch(
            `${process.env.EXPO_PUBLIC_API_URL}intercambio/${chatInfo?.intercambio_id}/estado-actualizado`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );
          console.log("Polling estado intercambio, respuesta:", res.status);

          if (!res.ok) {
            const text = await res.text();
            throw new Error(
              `Error al verificar estado: ${res.status} - ${text}`
            );
          }

          const data = await res.json();

          if (data.estado === "CONCRETADO") {
            console.log(
              "✅ Estado es CONCRETADO - actualizando UI desde polling"
            );
            setValidationSuccess(true);

            setTimeout(() => {
              setValidationSuccess(false);
              setShowCodeModal(false);
              clearInterval(pollingIntervalRef.current!);
              pollingIntervalRef.current = null;
              // Redirigir a pantalla de reseña
              setShowReviewModal(true);
            }, 1500);
          }
        } catch (err) {
          console.error("Error en polling:", err);
          // No mostrar alerta aquí para evitar spam
        }
      }, 3000); // cada 3 segundos
    }

    // Limpiar intervalo al desmontar o cerrar modal
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [showCodeModal, isOwner, chatInfo?.intercambio_id, getValidAccessToken]);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const intercambio = intercambios?.find(
          (i) => i.id === Number(chatInfo?.intercambio_id)
        );
        if (intercambio) {
          const esPropietario = intercambio.rolUsuario === "Propietario";
          setIsOwner(esPropietario);
        }
      } catch (error) {
        console.error("Error al cargar datos del usuario:", error);
      }
    };
    cargarDatos();
  }, [chatInfo?.intercambio_id, intercambios, chatInfo?.usuario_email]);

  // 👇 Generar código cuando se abre el modal de código (solo para dueños)
  useEffect(() => {
    if (showCodeModal && isOwner && !codigoYaGenerado) {
      generarCodigoAlAbrir();
    }
  }, [showCodeModal, isOwner, codigoYaGenerado]);

  // 👇 Reiniciar estados cuando el modal de código se cierra
  useEffect(() => {
    if (!showCodeModal) {
      setCodigoYaGenerado(false);
      setCodigoGenerado("");
      setCodigoInput("");
      setValidationSuccess(false);
      setGenerating(false);

      // Detener polling si estaba activo
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    }
  }, [showCodeModal]);

  const generarCodigoAlAbrir = async () => {
    if (!isOwner) return;

    setGenerating(true);
    try {
      const token = await getValidAccessToken();
      if (!token) throw new Error("No hay token válido");

      const codigo = await generarCodigoValidacion(
        Number(chatInfo?.intercambio_id),
        token
      );
      setCodigoGenerado(codigo);
      setCodigoYaGenerado(true);
    } catch (err: any) {
      Alert.alert("Error", err.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleConcretar = () => {
    if (isOwner) {
      // Si es dueño, el código se generará automáticamente al abrir el modal
      setShowConfirmModal(false);
      setShowCodeModal(true);
    } else {
      // Si es acredor, abrir modal de código directamente
      setShowConfirmModal(false);
      setShowCodeModal(true);
    }
  };

  const handleCancelar = async () => {
    try {
      await cancelarIntercambio(Number(chatInfo?.intercambio_id));
      setShowConfirmModal(false);
      router.replace("/(intercambios)");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  const handleValidarCodigo = async () => {
    if (codigoInput.length !== 6) {
      Alert.alert("Error", "El código debe tener 6 caracteres");
      return;
    }

    try {
      setLoading(true);
      const token = await getValidAccessToken();
      if (!token) throw new Error("No hay token válido");

      await validarIntercambioConCodigo(
        Number(chatInfo?.intercambio_id),
        codigoInput,
        token
      );
      setValidationSuccess(true);

      setTimeout(() => {
        setValidationSuccess(false);
        setShowCodeModal(false);
        // Redirigir a pantalla de reseña
        setShowReviewModal(true);
      }, 1500);
    } catch (err: any) {
      Alert.alert("Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCerrarCodigoModal = () => {
    setShowCodeModal(false);
    setCodigoInput("");
    setValidationSuccess(false);

    // Detener polling si estaba activo
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  };

  const enviarReseña = async () => {
    if (rating === 0) {
      Alert.alert("Error", "Debes calificar la experiencia");
      return;
    }

    setReviewLoading(true);
    try {
      const token = await getValidAccessToken();
      if (!token) throw new Error("No hay token válido");

      const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}resenia`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          descripcion: feedback.trim() || "Sin comentarios",
          valoracion: rating,
          intercambioId: Number(chatInfo?.intercambio_id),
          reseniadoId: chatInfo?.usuario_id
        }),
      });

      // Si el backend responde solo texto, no intentes leer JSON
      const responseText = await res.text();

      if (!res.ok) {
        throw new Error(responseText || "Error al crear reseña");
      }

      // Cerrar modal y redirigir
      setShowReviewModal(false);
      setRating(0);
      setFeedback("");
      router.replace("/(perfil)");
    } catch (err: any) {
      console.error("Error al enviar reseña:", err);
      Alert.alert("Error", err.message);
    } finally {
      setReviewLoading(false);
    }
  };

  if (intercambioLoading || !chatInfo?.usuario || loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#000" />
        <Text>Cargando...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ alignItems: "center" }}
    >
      <View style={styles.principal}>
        <Avatar name={chatInfo?.usuario || ""} size={104} />
        <Text style={styles.tittle}>
          {chatInfo?.usuario}
        </Text>
      </View>
      <View style={styles.sub}>
        <Pressable
          onPress={() => router.replace(`/(perfil)/publico${chatInfo?.usuario_id}`)}
        >
          <Ionicons
            name="person-circle-outline"
            size={30}
            color={Colors.secondary}
            style={styles.profileIcon}
          />
        </Pressable>
        <PrimaryButton
          title="Finalizar intercambio"
          onPress={() => setShowConfirmModal(true)}
        />
      </View>
      <View style={styles.info}>
        <Text style={styles.subtittle}>Información del Intercambio</Text>
        <Text style={styles.text}>Publicación: {chatInfo?.titulo_publicacion}</Text>
        <Text style={styles.text}>
          Fecha de Inicio: {formatDate(chatInfo.fecha_inicio)}
        </Text>
      </View>

      {/* Modal de confirmación */}
      <Modal
        animationType="fade"
        transparent
        visible={showConfirmModal}
        onRequestClose={() => setShowConfirmModal(false)}
      >
        <View style={styles.modalOverlay}>
          <AlertCard
            title={`Finalizar intercambio de "${chatInfo?.titulo_publicacion}"?`}
            description="¿Estás seguro de que deseas concretar este intercambio?"
            onAccept={handleConcretar}
            onCancel={handleCancelar}
            acceptLabel={isOwner ? "Generar código" : "Ingresar código"}
            cancelLabel="Cancelar"
          />
        </View>
      </Modal>

      {/* Modal de código de validación */}
      <Modal
        animationType="fade"
        transparent
        visible={showCodeModal}
        onRequestClose={handleCerrarCodigoModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.codigoModalContent}>
            <Text style={styles.codigoModalTitle}>
              {isOwner ? "Código de validación" : "Validar intercambio"}
            </Text>

            {isOwner ? (
              // Vista para dueño
              generating ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={Colors.primary} />
                  <Text>Generando código...</Text>
                </View>
              ) : (
                <View style={styles.codigoContainer}>
                  <Text style={styles.codigoLabel}>Código generado:</Text>
                  <Text style={styles.codigoText}>{codigoGenerado}</Text>
                  <Text style={styles.codigoInstrucciones}>
                    Comparte este código con el otro usuario para que pueda
                    validar el intercambio.
                  </Text>
                </View>
              )
            ) : (
              // Vista para acredor
              <View style={styles.inputContainer}>
                <Text style={styles.codigoLabel}>Ingresa el código:</Text>
                <TextInput
                  style={styles.codigoInput}
                  placeholder="ABCDEF"
                  value={codigoInput}
                  onChangeText={setCodigoInput}
                  maxLength={6}
                  autoCapitalize="characters"
                  keyboardType="default"
                />
              </View>
            )}

            {validationSuccess && (
              <Text style={styles.successText}>
                ¡Intercambio validado exitosamente!
              </Text>
            )}

            <View style={styles.codigoModalButtons}>
              {isOwner ? (
                <PrimaryButton
                  title="Cerrar"
                  styleBtn={{ width: "80%", alignSelf: "center" }}
                  onPress={handleCerrarCodigoModal}
                />
              ) : (
                <>
                  <PrimaryButton
                    styleBtn={{ width: "50%" }}
                    title="Validar"
                    onPress={handleValidarCodigo}
                    disabled={codigoInput.length !== 6 || loading}
                  />
                  <SecondaryButton
                    styleBtn={{ width: "50%" }}
                    title="Cerrar"
                    onPress={handleCerrarCodigoModal}
                  />
                </>
              )}
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de reseña */}
      <Modal
        animationType="fade"
        transparent
        visible={showReviewModal}
        onRequestClose={() => setShowReviewModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.reviewModalContent}>
            {/* Paso 1: Felicitación */}
            {reviewStep === 1 && (
              <>
                <Text style={styles.reviewTitle}>¡Felicitaciones!</Text>
                <Text style={styles.reviewText}>
                  Concretaste tu intercambio con éxito. Te invitamos a dejar una
                  reseña compartiendo tu experiencia con el usuario.
                </Text>
                <View style={styles.reviewButtons}>
                  <SecondaryButton
                    styleBtn={{ width: "50%" }}
                    title="Cancelar"
                    onPress={() => {
                      setShowReviewModal(false);
                      router.push("/(perfil)"); // 👈 REDIRECCIÓN A PERFIL
                    }}
                  />
                  <PrimaryButton
                    styleBtn={{ width: "50%" }}
                    title="Aceptar"
                    onPress={() => setReviewStep(2)}
                  />
                </View>
              </>
            )}

            {/* Paso 2: Preguntar si quiere calificar */}
            {reviewStep === 2 && (
              <>
                <Text style={styles.reviewTitle}>
                  ¿Quieres calificar tu intercambio?
                </Text>
                <Text style={styles.reviewText}>
                  Tu opinión ayuda a otros usuarios y mejora la comunidad.
                </Text>
                <View style={styles.reviewButtons}>
                  <SecondaryButton
                    styleBtn={{ width: "50%" }}
                    title="Cancelar"
                    onPress={() => {
                      setShowReviewModal(false);
                      router.push("/(perfil)"); // 👈 REDIRECCIÓN A PERFIL
                    }}
                  />
                  <PrimaryButton
                    styleBtn={{ width: "50%" }}
                    title="Aceptar"
                    onPress={() => setReviewStep(3)}
                  />
                </View>
              </>
            )}

            {/* Paso 3: Calificar con estrellas */}
            {reviewStep === 3 && (
              <>
                <Text style={styles.reviewTitle}>
                  ¿Cómo fue tu experiencia?
                </Text>
                <View style={styles.starsContainer}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity
                      key={star}
                      onPress={() => setRating(star)}
                    >
                      <Ionicons
                        name={star <= rating ? "star" : "star-outline"}
                        size={32}
                        color={star <= rating ? Colors.secondary : Colors.primary}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
                <View style={styles.reviewButtons}>
                  <SecondaryButton
                    styleBtn={{ width: "50%" }}
                    title="Atras"
                    onPress={() => setReviewStep(2)}
                  />
                  <PrimaryButton
                    title="Aceptar"
                    styleBtn={{ width: "50%" }}
                    onPress={() => setReviewStep(4)}
                    disabled={rating === 0}
                  />
                </View>
              </>
            )}

            {/* Paso 4: ¿Qué salió bien? ¿Qué se puede mejorar? */}
            {reviewStep === 4 && (
              <>
                <Text style={styles.reviewTitle}>Cuéntanos más</Text>
                <Text style={styles.reviewText}>
                  ¿Qué salió bien en el intercambio? ¿Hay algo que deberíamos
                  mejorar?
                </Text>
                <TextInput
                  style={styles.feedbackInput}
                  placeholder="Ej: El usuario fue puntual y amable. Podría mejorar la comunicación."
                  value={feedback}
                  onChangeText={setFeedback}
                  multiline
                  numberOfLines={4}
                />
                <View style={styles.reviewButtons}>
                  <SecondaryButton
                    styleBtn={{ width: "50%" }}
                    title="Atras"
                    onPress={() => setReviewStep(3)}
                  />
                  <PrimaryButton
                    styleBtn={{ width: "50%" }}
                    title="Enviar reseña"
                    onPress={() => setReviewStep(5)}
                  />
                </View>
              </>
            )}

            {/* Paso 5: Gracias */}
            {reviewStep === 5 && (
              <>
                <Text style={styles.reviewTitle}>¡Gracias por tu reseña!</Text>
                <Text style={styles.reviewText}>
                  Tu opinión ayuda a otros usuarios y mejora la comunidad.
                </Text>
                <View style={styles.reviewButtons}>
                  <SecondaryButton
                    styleBtn={{ width: "50%" }}
                    title="Cerrar"
                    onPress={() => {
                      setShowReviewModal(false);
                      router.push("/(perfil)"); // 👈 REDIRECCIÓN A PERFIL
                    }}
                  />
                  <PrimaryButton
                    styleBtn={{ width: "50%" }}
                    title="Aceptar"
                    onPress={enviarReseña}
                    disabled={reviewLoading}
                  />
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  principal: {
    alignItems: "center",
    gap: 22,
    marginTop: 40,
    marginBottom: 38,
  },
  tittle: {
    fontSize: 24,
    fontWeight: "600",
    color: Colors.text,
  },
  sub: {
    flexDirection: "row",
    gap: 49,
    marginBottom: 38,
    width: "100%",
    paddingHorizontal: 8,
    justifyContent: "center",
  },
  profileIcon: {},
  info: {
    gap: 32,
    paddingLeft: 44,
    paddingRight: 20,
    paddingVertical: 10,
    width: "100%",
  },
  subtittle: {
    fontSize: 20,
    fontWeight: "600",
    color: Colors.text,
  },
  text: {
    fontSize: 16,
    color: Colors.text,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  codigoModalContent: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 20,
    width: "90%",
    maxWidth: 400,
  },
  codigoModalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
  },
  codigoContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  codigoLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  codigoText: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.primary,
    backgroundColor: Colors.background,
    padding: 12,
    borderRadius: 8,
    letterSpacing: 4,
    textAlign: "center",
  },
  codigoInstrucciones: {
    fontSize: 14,
    color: Colors.primary,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  codigoInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 18,
    textAlign: "center",
    letterSpacing: 4,
  },
  successText: {
    color: "green",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
  },
  codigoModalButtons: {
    flexDirection: "row",
    gap: 8,
    marginTop: 16,
    justifyContent: "center",
  },
  reviewModalContent: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    width: "90%",
    maxWidth: 400,
  },
  reviewTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
  },
  reviewText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 20,
  },
  starsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginBottom: 20,
  },
  feedbackInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    textAlignVertical: "top",
    minHeight: 100,
    marginBottom: 20,
  },
  reviewButtons: {
    flexDirection: "row",
    gap: 8,
    marginTop: 16,
    justifyContent: "center",
  },
});