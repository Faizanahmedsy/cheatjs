import {
  Brain,
  Bot,
  MessageSquare,
  Cpu,
  Database,
  Settings,
  Layers,
  Search,
  TrendingUp,
  Zap,
  type LucideIcon,
} from "lucide-react";

type CodeStep = {
  title: string;
  explanation: string;
  code: string;
  language: string;
};

export type AITopic = {
  id: string;
  label: string;
  icon: LucideIcon;
  href: string;
  content: {
    title: string;
    description: string;
    steps: CodeStep[];
  };
};

export type AIGroup = {
  name: string;
  topics: AITopic[];
};

// Foundations Group
const foundationTopics: AITopic[] = [
  {
    id: "ml-fundamentals",
    label: "ML Fundamentals",
    icon: TrendingUp,
    href: "/ai-engineering?topic=ml-fundamentals",
    content: {
      title: "Machine Learning Fundamentals",
      description:
        "Core concepts of machine learning — supervised, unsupervised, and reinforcement learning.",
      steps: [
        {
          title: "Types of Machine Learning",
          explanation:
            "Machine learning is broadly categorized into supervised learning (labeled data), unsupervised learning (no labels), and reinforcement learning (reward-based).",
          code: `# Supervised Learning: Classification & Regression
# We have input-output pairs (features → labels)

# Classification: Predict a category
from sklearn.ensemble import RandomForestClassifier

model = RandomForestClassifier(n_estimators=100)
model.fit(X_train, y_train)  # X=features, y=labels
predictions = model.predict(X_test)

# Regression: Predict a continuous value
from sklearn.linear_model import LinearRegression

model = LinearRegression()
model.fit(X_train, y_train)
predicted_price = model.predict(X_test)

# Unsupervised Learning: No labels
from sklearn.cluster import KMeans

kmeans = KMeans(n_clusters=3)
clusters = kmeans.fit_predict(X)  # Groups similar data points

# Key Metrics:
# Classification → Accuracy, Precision, Recall, F1
# Regression → MSE, RMSE, MAE, R²`,
          language: "python",
        },
        {
          title: "Train / Validation / Test Split",
          explanation:
            "Always split your data into train, validation, and test sets to prevent overfitting and get reliable estimates of model performance.",
          code: `from sklearn.model_selection import train_test_split

# Step 1: Split into train+val and test (80/20)
X_trainval, X_test, y_trainval, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Step 2: Split train+val into train and val (75/25 of 80% = 60/20)
X_train, X_val, y_train, y_val = train_test_split(
    X_trainval, y_trainval, test_size=0.25, random_state=42
)

# Result: 60% train, 20% validation, 20% test
print(f"Train: {len(X_train)}, Val: {len(X_val)}, Test: {len(X_test)}")

# Why 3 splits?
# Train → Model learns from this
# Validation → Tune hyperparameters, prevent overfitting
# Test → Final evaluation (only use ONCE!)

# Common mistake: Tuning on test set → overfitting to test data
# This gives you a false sense of how well your model generalizes`,
          language: "python",
        },
      ],
    },
  },
  {
    id: "neural-networks",
    label: "Neural Networks",
    icon: Brain,
    href: "/ai-engineering?topic=neural-networks",
    content: {
      title: "Neural Networks",
      description:
        "Understanding the building blocks of deep learning — neurons, layers, activation functions, and backpropagation.",
      steps: [
        {
          title: "Basic Neural Network with PyTorch",
          explanation:
            "A neural network is layers of neurons. Each neuron applies a linear transformation followed by a non-linear activation function.",
          code: `import torch
import torch.nn as nn

# Define a simple neural network
class SimpleNet(nn.Module):
    def __init__(self, input_size, hidden_size, output_size):
        super(SimpleNet, self).__init__()
        self.layer1 = nn.Linear(input_size, hidden_size)
        self.relu = nn.ReLU()        # Activation function
        self.layer2 = nn.Linear(hidden_size, output_size)
    
    def forward(self, x):
        x = self.layer1(x)   # Linear: y = Wx + b
        x = self.relu(x)     # Non-linearity
        x = self.layer2(x)   # Output layer
        return x

# Create model
model = SimpleNet(input_size=784, hidden_size=128, output_size=10)

# Loss function & optimizer
criterion = nn.CrossEntropyLoss()
optimizer = torch.optim.Adam(model.parameters(), lr=0.001)

# Training loop
for epoch in range(num_epochs):
    outputs = model(X_train)          # Forward pass
    loss = criterion(outputs, y_train) # Compute loss
    
    optimizer.zero_grad()              # Clear gradients
    loss.backward()                    # Backpropagation
    optimizer.step()                   # Update weights`,
          language: "python",
        },
        {
          title: "Key Activation Functions",
          explanation:
            "Activation functions introduce non-linearity. Without them, stacking layers would just be one big linear transformation.",
          code: `import torch.nn.functional as F

# ReLU: max(0, x) — most common, fast
x = F.relu(x)
# Pros: Simple, no vanishing gradient for positive values
# Cons: "Dead neurons" (always 0 for negative inputs)

# Sigmoid: 1 / (1 + e^(-x)) — output between 0 and 1
x = torch.sigmoid(x)
# Pros: Good for binary classification output
# Cons: Vanishing gradient, not zero-centered

# Tanh: (e^x - e^(-x)) / (e^x + e^(-x)) — output between -1 and 1
x = torch.tanh(x)
# Pros: Zero-centered
# Cons: Still has vanishing gradient

# GELU: Used in Transformers (GPT, BERT)
x = F.gelu(x)
# Pros: Smooth, works great with transformers
# Used in: GPT-2, GPT-3, BERT

# Softmax: Converts logits to probabilities (sums to 1)
probs = F.softmax(logits, dim=-1)
# Used for: Multi-class classification output layer

# Rule of thumb:
# Hidden layers → ReLU (default) or GELU (transformers)
# Output layer → Sigmoid (binary), Softmax (multi-class), None (regression)`,
          language: "python",
        },
      ],
    },
  },
  {
    id: "transformers",
    label: "Transformers",
    icon: Cpu,
    href: "/ai-engineering?topic=transformers",
    content: {
      title: "Transformer Architecture",
      description:
        "The architecture behind GPT, BERT, and modern LLMs — self-attention, positional encoding, and encoder-decoder.",
      steps: [
        {
          title: "Self-Attention Mechanism",
          explanation:
            "Self-attention allows each token to 'look at' every other token in the sequence, learning which parts are relevant to each other. This is the core innovation of transformers.",
          code: `import torch
import torch.nn.functional as F

def self_attention(query, key, value, d_k):
    """
    Scaled Dot-Product Attention
    
    Q (Query): What am I looking for?
    K (Key):   What do I contain?
    V (Value): What information do I give?
    """
    # Step 1: Compute attention scores
    scores = torch.matmul(query, key.transpose(-2, -1)) / (d_k ** 0.5)
    
    # Step 2: Softmax to get attention weights (probabilities)
    attention_weights = F.softmax(scores, dim=-1)
    
    # Step 3: Weighted sum of values
    output = torch.matmul(attention_weights, value)
    
    return output, attention_weights

# Example: "The cat sat on the mat"
# When processing "sat":
# - High attention to "cat" (who sat?)
# - High attention to "mat" (where sat?)
# - Low attention to "the" (less relevant)

# Multi-Head Attention: Run multiple attention in parallel
# Each "head" can learn different relationships
# Head 1 might learn syntax, Head 2 might learn semantics`,
          language: "python",
        },
        {
          title: "Using Hugging Face Transformers",
          explanation:
            "Hugging Face provides pre-trained transformer models ready to use for various NLP tasks.",
          code: `from transformers import pipeline, AutoTokenizer, AutoModel

# Easy way: Use pipelines for common tasks
# Sentiment Analysis
classifier = pipeline("sentiment-analysis")
result = classifier("I love learning AI engineering!")
# [{'label': 'POSITIVE', 'score': 0.9998}]

# Text Generation
generator = pipeline("text-generation", model="gpt2")
text = generator("AI engineering is", max_length=50)

# Question Answering
qa = pipeline("question-answering")
answer = qa(
    question="What is a transformer?",
    context="A transformer is a deep learning architecture..."
)

# Advanced: Load model and tokenizer directly
tokenizer = AutoTokenizer.from_pretrained("bert-base-uncased")
model = AutoModel.from_pretrained("bert-base-uncased")

# Tokenize text
inputs = tokenizer("Hello, AI world!", return_tensors="pt")
# {'input_ids': tensor([[101, 7592, 1010, 9932, 2088, 999, 102]]),
#  'attention_mask': tensor([[1, 1, 1, 1, 1, 1, 1]])}

# Get embeddings
outputs = model(**inputs)
embeddings = outputs.last_hidden_state  # Shape: (1, 7, 768)`,
          language: "python",
        },
      ],
    },
  },
];

// LLM Engineering Group
const llmTopics: AITopic[] = [
  {
    id: "prompt-engineering",
    label: "Prompt Engineering",
    icon: MessageSquare,
    href: "/ai-engineering?topic=prompt-engineering",
    content: {
      title: "Prompt Engineering",
      description:
        "Master the art of crafting effective prompts — few-shot, chain-of-thought, and system prompts.",
      steps: [
        {
          title: "Prompt Engineering Techniques",
          explanation:
            "Different prompting strategies can dramatically improve LLM outputs. These are essential tools for any AI engineer.",
          code: `# 1. ZERO-SHOT PROMPTING
# Just ask directly — works for simple tasks
prompt = "Classify the sentiment: 'This movie was amazing!' → "
# Output: Positive

# 2. FEW-SHOT PROMPTING
# Provide examples to guide the model
prompt = """Classify the sentiment:
'I love this!' → Positive
'Terrible experience' → Negative
'It was okay' → Neutral
'Best purchase ever!' → """
# Output: Positive

# 3. CHAIN-OF-THOUGHT (CoT)
# Ask the model to reason step by step
prompt = """Q: A store has 23 apples. 
They sell 15 and receive a shipment of 12. 
How many apples do they have?

Let's think step by step:
1. Start with 23 apples
2. Sold 15: 23 - 15 = 8
3. Received 12: 8 + 12 = 20
Answer: 20 apples

Q: A bakery made 45 cakes. They sold 28 
and made 17 more. How many cakes?

Let's think step by step:"""
# The model follows the reasoning pattern

# 4. SYSTEM PROMPTS (for chat models)
messages = [
    {"role": "system", "content": "You are a senior Python developer. "
     "Always provide type hints and docstrings. "
     "Explain your code thoroughly."},
    {"role": "user", "content": "Write a function to merge two sorted lists."}
]`,
          language: "python",
        },
        {
          title: "Advanced Prompting Patterns",
          explanation:
            "More sophisticated techniques to get better, more reliable results from LLMs.",
          code: `# 5. ROLE PROMPTING
prompt = """You are an expert database architect with 20 years 
of experience. Review this schema and suggest improvements:

CREATE TABLE users (
    id INT PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100)
);"""

# 6. OUTPUT FORMAT CONTROL
prompt = """Extract entities from the text and return as JSON:

Text: "Apple CEO Tim Cook announced the iPhone 15 in Cupertino"

Return format:
{
  "companies": [],
  "people": [],
  "products": [],
  "locations": []
}"""

# 7. SELF-CONSISTENCY
# Ask the same question multiple times with temperature > 0
# Take the majority vote for more reliable answers

# 8. TREE OF THOUGHTS
prompt = """Consider this problem from multiple angles:

Expert 1 (Optimistic): ...
Expert 2 (Skeptical): ...
Expert 3 (Pragmatic): ...

Now, synthesize the best approach:"""

# 9. RETRIEVAL-AUGMENTED GENERATION (RAG) Prompt
prompt = f"""Answer based ONLY on the provided context. 
If the answer isn't in the context, say "I don't know."

Context:
{retrieved_documents}

Question: {user_question}
Answer:"""`,
          language: "python",
        },
      ],
    },
  },
  {
    id: "openai-api",
    label: "OpenAI API",
    icon: Bot,
    href: "/ai-engineering?topic=openai-api",
    content: {
      title: "Working with OpenAI API",
      description:
        "Build AI applications using the OpenAI API — chat completions, function calling, and structured outputs.",
      steps: [
        {
          title: "Chat Completions API",
          explanation:
            "The core API for interacting with GPT models. Understand messages, roles, and parameters.",
          code: `from openai import OpenAI

client = OpenAI(api_key="sk-...")

# Basic chat completion
response = client.chat.completions.create(
    model="gpt-4o",
    messages=[
        {"role": "system", "content": "You are a helpful AI assistant."},
        {"role": "user", "content": "Explain RAG in simple terms."}
    ],
    temperature=0.7,    # 0=deterministic, 1=creative
    max_tokens=500,     # Max response length
    top_p=0.9,          # Nucleus sampling
)

answer = response.choices[0].message.content
print(answer)

# Streaming response (for real-time UIs)
stream = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Write a poem about AI"}],
    stream=True,
)

for chunk in stream:
    if chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="")`,
          language: "python",
        },
        {
          title: "Function Calling / Tool Use",
          explanation:
            "Allow the LLM to call functions in your code — this is how AI agents work.",
          code: `import json
from openai import OpenAI

client = OpenAI()

# Define available tools/functions
tools = [
    {
        "type": "function",
        "function": {
            "name": "get_weather",
            "description": "Get current weather for a location",
            "parameters": {
                "type": "object",
                "properties": {
                    "location": {
                        "type": "string",
                        "description": "City name, e.g. London"
                    },
                    "unit": {
                        "type": "string",
                        "enum": ["celsius", "fahrenheit"]
                    }
                },
                "required": ["location"]
            }
        }
    }
]

# Call with tools
response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "What's the weather in Tokyo?"}],
    tools=tools,
    tool_choice="auto",
)

# Check if model wants to call a function
message = response.choices[0].message
if message.tool_calls:
    tool_call = message.tool_calls[0]
    args = json.loads(tool_call.function.arguments)
    
    # Execute the actual function
    weather_data = get_weather(**args)
    
    # Send result back to model
    follow_up = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "user", "content": "What's the weather in Tokyo?"},
            message,
            {
                "role": "tool",
                "tool_call_id": tool_call.id,
                "content": json.dumps(weather_data)
            }
        ]
    )`,
          language: "python",
        },
      ],
    },
  },
  {
    id: "embeddings",
    label: "Embeddings",
    icon: Database,
    href: "/ai-engineering?topic=embeddings",
    content: {
      title: "Text Embeddings",
      description:
        "Convert text into numerical vectors for semantic search, clustering, and RAG systems.",
      steps: [
        {
          title: "Understanding Embeddings",
          explanation:
            "Embeddings convert text into dense numerical vectors where semantically similar text has similar vectors. They are the foundation of RAG and semantic search.",
          code: `from openai import OpenAI
import numpy as np

client = OpenAI()

# Generate embeddings
def get_embedding(text, model="text-embedding-3-small"):
    response = client.embeddings.create(
        input=text,
        model=model
    )
    return response.data[0].embedding

# Example: Compare semantic similarity
emb1 = get_embedding("The cat sat on the mat")
emb2 = get_embedding("A feline rested on the rug")
emb3 = get_embedding("The stock market crashed today")

# Cosine similarity
def cosine_similarity(a, b):
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

sim_12 = cosine_similarity(emb1, emb2)  # ~0.85 (similar meaning!)
sim_13 = cosine_similarity(emb1, emb3)  # ~0.15 (different meaning)

print(f"Cat/Feline similarity: {sim_12:.3f}")
print(f"Cat/Stock similarity:  {sim_13:.3f}")

# Models:
# text-embedding-3-small → 1536 dims, cheaper, fast
# text-embedding-3-large → 3072 dims, more accurate
# Consider: Sentence-transformers (free, local)`,
          language: "python",
        },
        {
          title: "Vector Database with ChromaDB",
          explanation:
            "Store and query embeddings efficiently using a vector database — essential for building RAG systems.",
          code: `import chromadb
from chromadb.utils import embedding_functions

# Initialize ChromaDB
client = chromadb.PersistentClient(path="./chroma_db")

# Use OpenAI or Sentence-Transformers for embeddings
openai_ef = embedding_functions.OpenAIEmbeddingFunction(
    api_key="sk-...",
    model_name="text-embedding-3-small"
)

# Create a collection (like a table)
collection = client.create_collection(
    name="knowledge_base",
    embedding_function=openai_ef
)

# Add documents
collection.add(
    documents=[
        "Python is a programming language",
        "JavaScript runs in the browser",
        "React is a UI framework by Meta",
        "PyTorch is used for deep learning",
    ],
    ids=["doc1", "doc2", "doc3", "doc4"],
    metadatas=[
        {"topic": "python"}, 
        {"topic": "javascript"},
        {"topic": "javascript"},
        {"topic": "python"},
    ]
)

# Query: Find similar documents
results = collection.query(
    query_texts=["machine learning frameworks"],
    n_results=2
)
# Returns: PyTorch and Python docs (most similar!)

# Filter by metadata
results = collection.query(
    query_texts=["web development"],
    n_results=2,
    where={"topic": "javascript"}
)`,
          language: "python",
        },
      ],
    },
  },
];

// Applied AI Group
const appliedTopics: AITopic[] = [
  {
    id: "rag",
    label: "RAG Systems",
    icon: Search,
    href: "/ai-engineering?topic=rag",
    content: {
      title: "Retrieval-Augmented Generation (RAG)",
      description:
        "Build AI systems that retrieve relevant context before generating answers — reducing hallucinations and keeping knowledge current.",
      steps: [
        {
          title: "Basic RAG Pipeline",
          explanation:
            "RAG combines retrieval (finding relevant docs) with generation (LLM answering). This grounds the LLM's response in actual data.",
          code: `from openai import OpenAI
import chromadb

client = OpenAI()
chroma = chromadb.PersistentClient(path="./rag_db")

# Step 1: INDEX — Chunk and store documents
def index_documents(texts, collection_name="docs"):
    collection = chroma.get_or_create_collection(collection_name)
    
    # Chunk documents (simple approach)
    chunks = []
    for i, text in enumerate(texts):
        # Split into ~500 char chunks with overlap
        for j in range(0, len(text), 400):
            chunk = text[j:j+500]
            chunks.append({
                "text": chunk,
                "id": f"doc{i}_chunk{j}",
                "metadata": {"source": f"doc_{i}"}
            })
    
    collection.add(
        documents=[c["text"] for c in chunks],
        ids=[c["id"] for c in chunks],
        metadatas=[c["metadata"] for c in chunks],
    )
    return collection

# Step 2: RETRIEVE — Find relevant chunks
def retrieve(query, collection, n_results=3):
    results = collection.query(
        query_texts=[query],
        n_results=n_results
    )
    return results["documents"][0]

# Step 3: GENERATE — Answer using retrieved context
def rag_query(question, collection):
    # Retrieve relevant chunks
    context_chunks = retrieve(question, collection)
    context = "\\n\\n".join(context_chunks)
    
    # Generate answer with context
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": 
             "Answer based ONLY on the context provided. "
             "If the answer isn't in the context, say so."},
            {"role": "user", "content": 
             f"Context:\\n{context}\\n\\nQuestion: {question}"}
        ]
    )
    return response.choices[0].message.content

# Usage
collection = index_documents(my_documents)
answer = rag_query("How does authentication work?", collection)`,
          language: "python",
        },
        {
          title: "Advanced RAG Techniques",
          explanation:
            "Improve RAG quality with better chunking, re-ranking, and hybrid search.",
          code: `# 1. BETTER CHUNKING: Recursive Text Splitter
from langchain.text_splitter import RecursiveCharacterTextSplitter

splitter = RecursiveCharacterTextSplitter(
    chunk_size=500,
    chunk_overlap=50,        # Overlap prevents cutting context
    separators=["\\n\\n", "\\n", ". ", " "]  # Split at natural boundaries
)
chunks = splitter.split_text(document)

# 2. HYBRID SEARCH: Combine keyword + semantic search
# Keyword search (BM25) catches exact matches
# Semantic search catches meaning
# Together they're more robust

# Using LangChain's hybrid retriever
from langchain.retrievers import EnsembleRetriever
from langchain_community.retrievers import BM25Retriever

bm25 = BM25Retriever.from_texts(chunks)
vector = vectorstore.as_retriever()
hybrid = EnsembleRetriever(
    retrievers=[bm25, vector],
    weights=[0.4, 0.6]  # Favor semantic search
)

# 3. RE-RANKING: Score and re-order retrieved chunks
# After initial retrieval, use a cross-encoder to re-rank
from sentence_transformers import CrossEncoder

reranker = CrossEncoder("cross-encoder/ms-marco-MiniLM-L-6-v2")
pairs = [[query, chunk] for chunk in retrieved_chunks]
scores = reranker.predict(pairs)

# Sort by relevance score
ranked = sorted(zip(scores, retrieved_chunks), reverse=True)
top_chunks = [chunk for _, chunk in ranked[:3]]

# 4. CONTEXTUAL COMPRESSION
# Summarize each chunk to keep only relevant parts
# This reduces noise in the context window`,
          language: "python",
        },
      ],
    },
  },
  {
    id: "fine-tuning",
    label: "Fine-Tuning",
    icon: Settings,
    href: "/ai-engineering?topic=fine-tuning",
    content: {
      title: "Fine-Tuning LLMs",
      description:
        "Customize pre-trained models for your specific use case — when prompting alone isn't enough.",
      steps: [
        {
          title: "OpenAI Fine-Tuning",
          explanation:
            "Fine-tune GPT models on your own data to improve performance on specific tasks.",
          code: `from openai import OpenAI
import json

client = OpenAI()

# Step 1: Prepare training data (JSONL format)
training_data = [
    {
        "messages": [
            {"role": "system", "content": "You are a code reviewer."},
            {"role": "user", "content": "Review: x = x + 1"},
            {"role": "assistant", "content": "Use x += 1 instead of x = x + 1 "
             "for cleaner, more Pythonic code."}
        ]
    },
    {
        "messages": [
            {"role": "system", "content": "You are a code reviewer."},
            {"role": "user", "content": "Review: if len(lst) > 0:"},
            {"role": "assistant", "content": "Use 'if lst:' instead. "
             "Empty collections are falsy in Python."}
        ]
    }
]

# Save as JSONL
with open("training.jsonl", "w") as f:
    for entry in training_data:
        f.write(json.dumps(entry) + "\\n")

# Step 2: Upload training file
file = client.files.create(
    file=open("training.jsonl", "rb"),
    purpose="fine-tune"
)

# Step 3: Start fine-tuning job
job = client.fine_tuning.jobs.create(
    training_file=file.id,
    model="gpt-4o-mini-2024-07-18",
    hyperparameters={
        "n_epochs": 3,
        "learning_rate_multiplier": 1.8,
    }
)

# Step 4: Use fine-tuned model
response = client.chat.completions.create(
    model="ft:gpt-4o-mini-2024-07-18:org:custom:id",
    messages=[{"role": "user", "content": "Review: if x == True:"}]
)`,
          language: "python",
        },
        {
          title: "LoRA Fine-Tuning (Local)",
          explanation:
            "LoRA (Low-Rank Adaptation) lets you fine-tune large models efficiently by only training a small number of additional parameters.",
          code: `from peft import LoraConfig, get_peft_model
from transformers import (
    AutoModelForCausalLM, 
    AutoTokenizer, 
    TrainingArguments, 
    Trainer
)

# Load base model
model_name = "meta-llama/Llama-3.1-8B"
model = AutoModelForCausalLM.from_pretrained(model_name)
tokenizer = AutoTokenizer.from_pretrained(model_name)

# Configure LoRA
# Instead of training ALL parameters (8B!), 
# we train small adapter matrices (~1-10M params)
lora_config = LoraConfig(
    r=16,                    # Rank of update matrices
    lora_alpha=32,           # Scaling factor
    target_modules=[         # Which layers to adapt
        "q_proj", "k_proj", 
        "v_proj", "o_proj"
    ],
    lora_dropout=0.05,
    task_type="CAUSAL_LM",
)

# Apply LoRA to model
model = get_peft_model(model, lora_config)
model.print_trainable_parameters()
# "trainable params: 4,194,304 || all params: 8,030,261,248 
#  || trainable%: 0.052%"  ← Only 0.05% of params!

# Train
training_args = TrainingArguments(
    output_dir="./lora-finetuned",
    num_train_epochs=3,
    per_device_train_batch_size=4,
    learning_rate=2e-4,
    fp16=True,               # Mixed precision for speed
    save_strategy="epoch",
)

trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=tokenized_dataset,
)
trainer.train()

# Save just the adapter (small file!)
model.save_pretrained("./my-adapter")
# Adapter is ~20MB vs 16GB for full model`,
          language: "python",
        },
      ],
    },
  },
  {
    id: "ai-agents",
    label: "AI Agents",
    icon: Bot,
    href: "/ai-engineering?topic=ai-agents",
    content: {
      title: "Building AI Agents",
      description:
        "Create autonomous AI agents that can reason, plan, and use tools to accomplish complex tasks.",
      steps: [
        {
          title: "ReAct Agent Pattern",
          explanation:
            "The ReAct (Reasoning + Acting) pattern is the most common agent architecture. The LLM reasons about what to do, takes an action, observes the result, and repeats.",
          code: `from openai import OpenAI
import json

client = OpenAI()

# Define tools the agent can use
tools = [
    {
        "type": "function",
        "function": {
            "name": "search_web",
            "description": "Search the web for information",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {"type": "string", "description": "Search query"}
                },
                "required": ["query"]
            }
        }
    },
    {
        "type": "function", 
        "function": {
            "name": "run_python",
            "description": "Execute Python code and return output",
            "parameters": {
                "type": "object",
                "properties": {
                    "code": {"type": "string", "description": "Python code"}
                },
                "required": ["code"]
            }
        }
    }
]

# Agent loop
def run_agent(user_query, max_steps=5):
    messages = [
        {"role": "system", "content": 
         "You are a helpful AI agent. Use tools to answer questions. "
         "Think step by step before acting."},
        {"role": "user", "content": user_query}
    ]
    
    for step in range(max_steps):
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=messages,
            tools=tools,
            tool_choice="auto",
        )
        
        msg = response.choices[0].message
        messages.append(msg)
        
        # If no tool calls, agent is done
        if not msg.tool_calls:
            return msg.content
        
        # Execute tool calls
        for tool_call in msg.tool_calls:
            result = execute_tool(
                tool_call.function.name,
                json.loads(tool_call.function.arguments)
            )
            messages.append({
                "role": "tool",
                "tool_call_id": tool_call.id,
                "content": str(result)
            })
    
    return "Max steps reached"`,
          language: "python",
        },
        {
          title: "LangGraph Multi-Agent System",
          explanation:
            "Build complex agent workflows using LangGraph where multiple specialized agents collaborate.",
          code: `from langgraph.graph import StateGraph, END
from typing import TypedDict, Annotated
import operator

# Define state
class AgentState(TypedDict):
    messages: Annotated[list, operator.add]
    next_agent: str

# Define specialized agents
def researcher(state: AgentState) -> AgentState:
    """Research agent - searches for information"""
    messages = state["messages"]
    # Use LLM with search tool to find information
    result = llm_with_search.invoke(messages)
    return {
        "messages": [result],
        "next_agent": "analyzer"
    }

def analyzer(state: AgentState) -> AgentState:
    """Analysis agent - analyzes research findings"""
    messages = state["messages"]
    result = llm.invoke([
        {"role": "system", "content": "Analyze the research findings."},
        *messages
    ])
    return {
        "messages": [result],
        "next_agent": "writer"
    }

def writer(state: AgentState) -> AgentState:
    """Writer agent - produces final output"""
    messages = state["messages"]
    result = llm.invoke([
        {"role": "system", "content": "Write a clear, comprehensive report."},
        *messages
    ])
    return {
        "messages": [result],
        "next_agent": "end"
    }

# Build the graph
def route(state: AgentState) -> str:
    if state["next_agent"] == "end":
        return END
    return state["next_agent"]

graph = StateGraph(AgentState)
graph.add_node("researcher", researcher)
graph.add_node("analyzer", analyzer)
graph.add_node("writer", writer)

graph.set_entry_point("researcher")
graph.add_conditional_edges("researcher", route)
graph.add_conditional_edges("analyzer", route)
graph.add_conditional_edges("writer", route)

app = graph.compile()

# Run the multi-agent pipeline
result = app.invoke({
    "messages": [{"role": "user", "content": "Research AI trends in 2025"}],
    "next_agent": "researcher"
})`,
          language: "python",
        },
      ],
    },
  },
];

// MLOps Group
const mlopsTopics: AITopic[] = [
  {
    id: "evaluation",
    label: "LLM Evaluation",
    icon: Zap,
    href: "/ai-engineering?topic=evaluation",
    content: {
      title: "LLM Evaluation",
      description:
        "How to evaluate LLM outputs — automated metrics, LLM-as-judge, and building eval pipelines.",
      steps: [
        {
          title: "Evaluation Methods",
          explanation:
            "Evaluating LLMs requires different approaches than traditional ML. Here are the key methods.",
          code: `# 1. AUTOMATED METRICS (for specific tasks)

# BLEU Score — Machine Translation
from nltk.translate.bleu_score import sentence_bleu
reference = [["the", "cat", "is", "on", "the", "mat"]]
candidate = ["the", "cat", "sat", "on", "the", "mat"]
score = sentence_bleu(reference, candidate)  # 0.0 - 1.0

# ROUGE Score — Summarization
from rouge_score import rouge_scorer
scorer = rouge_scorer.RougeScorer(['rouge1', 'rougeL'])
scores = scorer.score(
    "The cat sat on the mat",
    "A cat was sitting on a mat"
)

# 2. LLM-AS-JUDGE (most versatile)
def llm_judge(question, answer, reference_answer):
    """Use a stronger LLM to evaluate answers"""
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{
            "role": "system",
            "content": """Rate the answer on a scale of 1-5:
            1: Completely wrong
            2: Partially correct but major errors
            3: Mostly correct with minor issues
            4: Correct with room for improvement
            5: Perfect answer
            
            Provide your rating and explanation."""
        }, {
            "role": "user",
            "content": f"""Question: {question}
            Reference Answer: {reference_answer}
            Model Answer: {answer}
            
            Rate the model's answer:"""
        }],
        temperature=0,
    )
    return response.choices[0].message.content

# 3. HUMAN EVALUATION (gold standard but expensive)
# Use for final validation, not iteration
# Common dimensions: Accuracy, Helpfulness, Harmlessness`,
          language: "python",
        },
        {
          title: "Building an Eval Pipeline",
          explanation:
            "A systematic evaluation pipeline lets you iterate on your AI system with confidence.",
          code: `import json
import pandas as pd

# Step 1: Create an eval dataset
eval_dataset = [
    {
        "id": "q1",
        "question": "What is RAG?",
        "expected": "Retrieval-Augmented Generation combines retrieval "
                    "with LLM generation to ground answers in data.",
        "category": "definition"
    },
    {
        "id": "q2",
        "question": "When should you fine-tune vs use RAG?",
        "expected": "Use RAG when you need current/specific data. "
                    "Fine-tune when you need to change model behavior.",
        "category": "comparison"
    },
]

# Step 2: Run your system on each question
def run_eval(system_fn, dataset):
    results = []
    for item in dataset:
        answer = system_fn(item["question"])
        
        # Score with LLM judge
        judgment = llm_judge(
            item["question"], 
            answer, 
            item["expected"]
        )
        
        results.append({
            "id": item["id"],
            "question": item["question"],
            "expected": item["expected"],
            "actual": answer,
            "score": extract_score(judgment),
            "explanation": judgment,
            "category": item["category"]
        })
    return pd.DataFrame(results)

# Step 3: Analyze results
df = run_eval(my_rag_system, eval_dataset)
print(f"Average Score: {df['score'].mean():.2f}")
print(f"\\nScores by Category:")
print(df.groupby('category')['score'].mean())

# Step 4: Track over time
# Save results for each version
df.to_csv(f"eval_results_v{version}.csv")
# Compare versions to ensure improvements don't regress`,
          language: "python",
        },
      ],
    },
  },
  {
    id: "deployment",
    label: "Deployment",
    icon: Layers,
    href: "/ai-engineering?topic=deployment",
    content: {
      title: "Deploying AI Applications",
      description:
        "Ship AI applications to production — API design, caching, rate limiting, and monitoring.",
      steps: [
        {
          title: "Production AI API with FastAPI",
          explanation:
            "Build a production-ready AI API with proper error handling, caching, and rate limiting.",
          code: `from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from openai import OpenAI
import hashlib
import redis
import time

app = FastAPI()
client = OpenAI()
cache = redis.Redis(host="localhost", port=6379)

class QueryRequest(BaseModel):
    question: str
    max_tokens: int = 500

class QueryResponse(BaseModel):
    answer: str
    cached: bool
    latency_ms: float

@app.post("/api/ask", response_model=QueryResponse)
async def ask_question(request: QueryRequest):
    start = time.time()
    
    # Check cache first
    cache_key = hashlib.md5(
        request.question.encode()
    ).hexdigest()
    
    cached = cache.get(cache_key)
    if cached:
        return QueryResponse(
            answer=cached.decode(),
            cached=True,
            latency_ms=(time.time() - start) * 1000
        )
    
    try:
        # Call LLM
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "Be concise and helpful."},
                {"role": "user", "content": request.question}
            ],
            max_tokens=request.max_tokens,
        )
        answer = response.choices[0].message.content
        
        # Cache for 1 hour
        cache.setex(cache_key, 3600, answer)
        
        return QueryResponse(
            answer=answer,
            cached=False,
            latency_ms=(time.time() - start) * 1000
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Run: uvicorn main:app --host 0.0.0.0 --port 8000`,
          language: "python",
        },
      ],
    },
  },
];

// Export groups
export const aiGroups: AIGroup[] = [
  {
    name: "Foundations",
    topics: foundationTopics,
  },
  {
    name: "LLM Engineering",
    topics: llmTopics,
  },
  {
    name: "Applied AI",
    topics: appliedTopics,
  },
  {
    name: "MLOps & Production",
    topics: mlopsTopics,
  },
];

// Flat list of all topics for easy lookup
export const allAITopics = [
  ...foundationTopics,
  ...llmTopics,
  ...appliedTopics,
  ...mlopsTopics,
];
