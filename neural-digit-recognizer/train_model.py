"""
train_model.py
Trains a small Convolutional Neural Network on MNIST and saves it to
backend/model/mnist_cnn.h5

Run once before starting the server:
    python train_model.py
"""

import os
import numpy as np
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers

# ── Reproducibility ───────────────────────────────────────────────────────────
tf.random.set_seed(42)
np.random.seed(42)

# ── Dataset ───────────────────────────────────────────────────────────────────
print("Loading MNIST …")
(x_train, y_train), (x_test, y_test) = keras.datasets.mnist.load_data()

x_train = x_train.astype("float32") / 255.0
x_test  = x_test.astype("float32")  / 255.0

# Shape: (N, 28, 28, 1)
x_train = x_train[..., np.newaxis]
x_test  = x_test[..., np.newaxis]

# ── Model ─────────────────────────────────────────────────────────────────────
def build_model() -> keras.Model:
    inputs = keras.Input(shape=(28, 28, 1))

    x = layers.Conv2D(32, 3, padding="same", activation="relu")(inputs)
    x = layers.BatchNormalization()(x)
    x = layers.Conv2D(32, 3, padding="same", activation="relu")(x)
    x = layers.MaxPooling2D()(x)
    x = layers.Dropout(0.25)(x)

    x = layers.Conv2D(64, 3, padding="same", activation="relu")(x)
    x = layers.BatchNormalization()(x)
    x = layers.Conv2D(64, 3, padding="same", activation="relu")(x)
    x = layers.MaxPooling2D()(x)
    x = layers.Dropout(0.25)(x)

    x = layers.Flatten()(x)
    x = layers.Dense(256, activation="relu")(x)
    x = layers.BatchNormalization()(x)
    x = layers.Dropout(0.5)(x)

    outputs = layers.Dense(10, activation="softmax")(x)

    return keras.Model(inputs, outputs, name="mnist_cnn")

model = build_model()
model.summary()

model.compile(
    optimizer=keras.optimizers.Adam(1e-3),
    loss="sparse_categorical_crossentropy",
    metrics=["accuracy"],
)

# ── Callbacks ─────────────────────────────────────────────────────────────────
callbacks = [
    keras.callbacks.EarlyStopping(patience=3, restore_best_weights=True),
    keras.callbacks.ReduceLROnPlateau(factor=0.5, patience=2, verbose=1),
]

# ── Train ─────────────────────────────────────────────────────────────────────
print("\nTraining …")
history = model.fit(
    x_train, y_train,
    epochs=15,
    batch_size=128,
    validation_split=0.1,
    callbacks=callbacks,
    verbose=1,
)

# ── Evaluate ──────────────────────────────────────────────────────────────────
loss, acc = model.evaluate(x_test, y_test, verbose=0)
print(f"\nTest accuracy: {acc * 100:.2f}%  |  Test loss: {loss:.4f}")

# ── Save ──────────────────────────────────────────────────────────────────────
save_dir = os.path.join(os.path.dirname(__file__), "backend", "model")
os.makedirs(save_dir, exist_ok=True)
save_path = os.path.join(save_dir, "mnist_cnn.h5")
model.save(save_path)
print(f"\n✅ Model saved → {save_path}")
