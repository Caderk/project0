import shutil
from torch.utils.data import DataLoader, random_split
from torchvision import datasets, transforms
import tarfile
import os

dirname = os.path.dirname(__file__)
filename = os.path.join(dirname, "./input/fer2013.tar.gz")

file = tarfile.open(filename)

# extracting file
file.extractall("./input")

file.close()
# Directories containing the training and test data
train_dir = "./input/fer2013/train"
test_dir = "./input/fer2013/test"

# Define transformations for the training data (data augmentation)
train_transforms = transforms.Compose(
    [
        transforms.Grayscale(num_output_channels=1),  # Convert images to grayscale
        transforms.RandomHorizontalFlip(),  # Randomly flip images horizontally
        transforms.RandomAffine(
            degrees=0,
            translate=(
                0.1,
                0.1,
            ),  # Randomly shift images by up to 10% in width and height
        ),
        transforms.ToTensor(),  # Convert images to PyTorch tensors
        transforms.Normalize((0.5,), (0.5,)),  # Normalize pixel values
    ]
)

# Define transformations for the validation/test data
val_transforms = transforms.Compose(
    [
        transforms.Grayscale(num_output_channels=1),  # Convert images to grayscale
        transforms.ToTensor(),  # Convert images to PyTorch tensors
        transforms.Normalize((0.5,), (0.5,)),  # Normalize pixel values
    ]
)

# Create the training dataset
full_train_dataset = datasets.ImageFolder(root=train_dir, transform=train_transforms)

# Split the training dataset into training and validation sets (80% training, 20% validation)
train_size = int(0.8 * len(full_train_dataset))
val_size = len(full_train_dataset) - train_size
train_dataset, val_dataset = random_split(full_train_dataset, [train_size, val_size])

# Create the test dataset
test_dataset = datasets.ImageFolder(root=test_dir, transform=val_transforms)

# Define data loaders
batch_size = 64

train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True)
validation_loader = DataLoader(val_dataset, batch_size=batch_size, shuffle=False)
test_loader = DataLoader(test_dataset, batch_size=batch_size, shuffle=False)

shutil.rmtree('./input/fer2013')