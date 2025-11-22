// src/components/ProductEditModal.tsx
import React, { useEffect, useRef, useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from "react-native";

type Props = {
  visible: boolean;
  code: string | null;
  initialName?: string;
  initialPrice?: number;
  /** stock inicial opcional para prefijar el campo cuando edites/crees */
  initialStock?: number;
  onCancel: () => void;
  onSave: (data: { code: string; name: string; price: number; stock?: number }) => void | Promise<void>;
};

export default function ProductEditModal({
  visible,
  code,
  initialName = "",
  initialPrice = 0,
  initialStock = 0,
  onCancel,
  onSave,
}: Props) {
  const [codeStr, setCodeStr] = useState(code || "");
  const [name, setName] = useState(initialName);
  const [priceStr, setPriceStr] = useState(String(initialPrice ?? 0));
  const [stockStr, setStockStr] = useState(String(initialStock ?? 0));
  const [saving, setSaving] = useState(false);

  const codeRef = useRef<TextInput>(null);
  const nameRef = useRef<TextInput>(null);
  const priceRef = useRef<TextInput>(null);
  const stockRef = useRef<TextInput>(null);

  useEffect(() => {
    if (visible) {
      setCodeStr(code || "");
      setName(initialName || "");
      setPriceStr(String(initialPrice ?? 0));
      setStockStr(String(initialStock ?? 0));
      setTimeout(() => codeRef.current?.focus(), 200);
    }
  }, [visible, code, initialName, initialPrice, initialStock]);

  const parsePrice = () => {
    const v = parseFloat(priceStr.replace(",", "."));
    return isNaN(v) ? 0 : v;
  };

  const parseStock = () => {
    const n = parseInt((stockStr ?? "0").replace(",", ".").split(".")[0] || "0", 10);
    return isNaN(n) ? 0 : n;
  };

  const handleSave = async () => {
    const price = parsePrice();
    const stock = parseStock();
    const nm = name.trim();
    const cd = codeStr.trim();
    if (!nm || !cd || saving) return;
    
    setSaving(true);
    try {
      await onSave({ code: cd, name: nm, price, stock });
    } finally {
      setSaving(false);
    }
  };

  const isEdit = !!initialName || !!initialPrice || !!initialStock;

  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
  const isTablet = screenWidth >= 768;
  // El teclado ocupa ~40% de la pantalla, entonces el modal debe caber en el 60% superior
  const availableHeight = screenHeight * 0.55; // 55% para estar seguro
  const modalHeight = Math.min(availableHeight, isTablet ? 450 : 400);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-start", paddingTop: 80, paddingHorizontal: isTablet ? screenWidth * 0.2 : 16, paddingBottom: screenHeight * 0.5 }}>
          <KeyboardAvoidingView
            behavior="position"
            keyboardVerticalOffset={0}
            style={{ flex: 1 }}
          >
            <View
              style={{
                backgroundColor: "white",
                borderRadius: 16,
                maxHeight: modalHeight,
                minHeight: 300,
              }}
            >
              <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
                <View style={{ alignItems: "center", marginBottom: 8 }}>
                  <View style={{ width: 40, height: 4, backgroundColor: "#e2e8f0", borderRadius: 2 }} />
                </View>

                <Text style={{ fontSize: 16, fontWeight: "700", marginBottom: 12 }}>
                  {isEdit ? "Editar producto" : "Nuevo producto"}
                </Text>
              </View>

              <ScrollView 
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
                showsVerticalScrollIndicator={false}
                style={{ maxHeight: modalHeight - 140 }}
              >
                <View style={{ gap: 12 }}>
                  <View style={{ gap: 6 }}>
                    <Text style={{ fontWeight: "600" }}>Código</Text>
                    <TextInput
                      ref={codeRef}
                      value={codeStr}
                      onChangeText={setCodeStr}
                      placeholder="Código del producto"
                      style={{ borderWidth: 1, borderColor: "#cbd5e1", borderRadius: 8, padding: 10, backgroundColor: "#ffffff", color: "#000000" }}
                      placeholderTextColor="#9ca3af"
                      returnKeyType="next"
                      onSubmitEditing={() => nameRef.current?.focus()}
                    />
                  </View>

                  <View style={{ gap: 6 }}>
                    <Text style={{ fontWeight: "600" }}>Nombre</Text>
                    <TextInput
                      ref={nameRef}
                      value={name}
                      onChangeText={setName}
                      placeholder="Nombre del producto"
                      style={{ borderWidth: 1, borderColor: "#cbd5e1", borderRadius: 8, padding: 10, backgroundColor: "#ffffff", color: "#000000" }}
                      returnKeyType="next"
                      onSubmitEditing={() => priceRef.current?.focus()}
                    />
                  </View>

                  <View style={{ gap: 6 }}>
                    <Text style={{ fontWeight: "600" }}>Precio</Text>
                    <View style={{ flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#cbd5e1", borderRadius: 8, backgroundColor: "#ffffff" }}>
                      <Text style={{ paddingLeft: 10, color: "#64748b", fontSize: 16 }}>$</Text>
                      <TextInput
                        ref={priceRef}
                        value={priceStr}
                        onChangeText={setPriceStr}
                        placeholder="0"
                        keyboardType="decimal-pad"
                        style={{ flex: 1, padding: 10, paddingLeft: 4, color: "#000000" }}
                        returnKeyType="next"
                        onSubmitEditing={() => stockRef.current?.focus()}
                      />
                    </View>
                  </View>

                  <View style={{ gap: 6 }}>
                    <Text style={{ fontWeight: "600" }}>
                      {isEdit ? "Stock" : "Stock inicial"} <Text style={{ color: "#64748b" }}>(entero)</Text>
                    </Text>
                    <TextInput
                      ref={stockRef}
                      value={stockStr}
                      onChangeText={setStockStr}
                      placeholder="0"
                      keyboardType="number-pad"
                      style={{ borderWidth: 1, borderColor: "#cbd5e1", borderRadius: 8, padding: 10, backgroundColor: "#ffffff", color: "#000000" }}
                      returnKeyType="done"
                      onSubmitEditing={handleSave}
                    />
                  </View>
                </View>
              </ScrollView>

              <View style={{ paddingHorizontal: 16, paddingBottom: 16, paddingTop: 8, backgroundColor: "white", borderBottomLeftRadius: 16, borderBottomRightRadius: 16 }}>
                <View style={{ flexDirection: "row", gap: 12 }}>
                  <TouchableOpacity
                    onPress={onCancel}
                    style={{ flex: 1, backgroundColor: "#f1f5f9", paddingVertical: 12, borderRadius: 10, alignItems: "center" }}
                  >
                    <Text style={{ color: "#334155", fontWeight: "600" }}>Cancelar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handleSave}
                    disabled={saving}
                    style={{ 
                      flex: 1, 
                      backgroundColor: saving ? "#94a3b8" : "#007AFF", 
                      paddingVertical: 12, 
                      borderRadius: 10, 
                      alignItems: "center",
                      flexDirection: "row",
                      justifyContent: "center",
                      gap: 8
                    }}
                  >
                    {saving && <ActivityIndicator color="white" size="small" />}
                    <Text style={{ color: "white", fontWeight: "700" }}>
                      {saving ? "Guardando..." : "Guardar"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
